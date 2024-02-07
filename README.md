# nf-lambda

This is a simple application that allows you to run lambda functions locally. Currently, it is only a webserver
that listens for requests, as work continues on this project it will be able to run lambda functions.

## Installation

```bash
yarn
```

## Usage

```bash
yarn start
```

## Environment Variables

```javascript
PORT=3000 // the port the server will run on
USE_SSL=true // if you want to use https
SSL_KEY="path/to/ssl/key" // the path to the SSL key
SSL_CERT="path/to/ssl/cert" // the path to the SSL cert
HTTP_TIMEOUT=30000 // the timeout for http requests
```

## Contributing
Right now this project is in its infancy, so I am not accepting contributions at this time. Unless you find a bug
or have a feature request, then please open an issue / pull request.

## License
MIT License
```
Copyright 2024 Richard Williamson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```