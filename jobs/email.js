const fs = require('fs');
const path = require('path');
const { parentPort } = require('worker_threads');

const Cabin = require('cabin');
const Email = require('email-templates');
const { Signale } = require('signale');

// initialize cabin
const cabin = new Cabin({
  axe: {
    logger: new Signale()
  }
});

// store boolean if the job is cancelled
let isCancelled = false;

// handle cancellation (this is a very simple example)
if (parentPort)
  parentPort.once('message', message => {
    if (message === 'cancel') isCancelled = true;
  });

// initialize email-templates
const email = new Email({
  message: {
    from: 'from@example.com'
  },
  transport: {
    jsonTransport: true
  }
});

// load the queue
const queueFile = path.join(__dirname, '..', 'queue.json');
if (!fs.existsSync(queueFile)) {
  cabin.info(`queue file does not exist yet: ${queueFile}`);
  // signal to parent that the job is done
  if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
}

const queue = require(queueFile);

(async () => {
  // send emails
  await Promise.all(
    queue.map(async result => {
      // if we've already cancelled this job then return early
      if (isCancelled) return;

      // if it's before the time we need to send the message then return early
      if (Date.now() < new Date(result.send_at).getTime()) {
        cabin.info('It it not time yet to send message', { result });
        return;
      }

      try {
        // send the email
        await email.send({
          message: {
            to: result.email,
            subject: 'Movie starts in less than 10 minutes!',
            html:
              '<p>Your movie will start in less than 10 minutes. Hurry up and grab your snacks.</p>'
          }
        });

        // flush the queue of this message
        try {
          const currentQueue = require(queueFile);
          const index = currentQueue.findIndex(r => r.id === result.id);
          if (index === -1) return;
          delete currentQueue[index];
          await fs.promises.writeFile(
            queueFile,
            JSON.stringify(currentQueue.filter(Boolean))
          );
        } catch (err) {
          cabin.error(err);
        }
      } catch (err) {
        cabin.error(err);
      }
    })
  );

  // signal to parent that the job is done
  if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
})();
