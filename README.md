# express-example

[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/breejs/express-example.svg)](LICENSE)

> This repository is just for example purposes.


## Table of Contents

* [Example](#example)
* [Contributors](#contributors)
* [License](#license)


## Example

This repository is just for example purposes.  If you want to run this example locally, then follow these steps:

1. Clone the repository locally and install dependencies:

   ```sh
   git clone https://github.com/breejs/express-example.git
   cd express-example
   npm install
   ```

2. Start the `app.js` and `bree.js` processes in separate terminal windows at the same time:

   ```sh
   node app.js
   ```

   ```sh
   node bree.js
   ```

3. Send example requests to the server (this will automatically open a browser tab for you with the rendered emails when they're sent):

   ```sh
   curl -X POST http://localhost:8080/send-email -d "email=foo@gmail.com" 
   ```

   ```sh
   curl -X POST http://localhost:8080/book-ticket -d "email=foo@gmail.com" -d "start_time=7/14/20 4:00 PM"
   ```

4. You can modify the payload `-d` parameter values in the previous example requests if you wish to test different "movie start times" or email addresses.  See the code in [app.js](app.js) and [bree.js](bree.js) for more insight.


## Contributors

| Name           | Website                    |
| -------------- | -------------------------- |
| **Nick Baugh** | <http://niftylettuce.com/> |


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com/)
