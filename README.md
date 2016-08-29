# DataFlower - The dataflow project

[![Build Status](https://travis-ci.org/inf3rno/dataflower.png?branch=sockets)](https://travis-ci.org/inf3rno/dataflower)

DataFlower eases async programming in javascript. 

## Installation

```bash
npm install dataflower
```

```bash
bower install dataflower
```

### Environment compatibility

This framework supports the same environments as the [error polyfill](https://github.com/inf3rno/error-polyfill) lib.

I used [Karma](https://github.com/karma-runner/karma) with [Browserify](https://github.com/substack/node-browserify) to test the framework in browsers and I used [Yadda](https://github.com/acuminous/yadda) to run the BDD tests.

### Requirements

The [ObjectZone](https://github.com/inf3rno/o3) and the [ErrorZone](https://github.com/inf3rno/e3) libs are required.

## Usage

In this documentation I used the framework as follows:

```js
var df = require("dataflower");
```

### Features

**I am working on a new API, so I removed the features supported by the previous API.**

## License

The MIT License (MIT)

Copyright (c) 2014 Jánszky László Lajos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.