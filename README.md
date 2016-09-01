# DataFlower - The dataflow project

[![Build Status](https://travis-ci.org/inf3rno/dataflower.png?branch=master)](https://travis-ci.org/inf3rno/dataflower)

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
var df = require("dataflower"),
    DataFlow = df.DataFlow;
```

### Features

**I am working on a new API, so I removed the features supported by the previous API.**


### DataFlow

Data flows are the most important building blocks of this project. They main purpose is data delivery, but you can use them for buffering data until somebody needs it. I tried to keep the interface of these flows as simple as possible, but I wanted to support both pull and push to make it more flexible.

Creating a flow is simple.

```js
var flow = new DataFlow();
```

By default the flow has the `aDataFlow` name, which you can change if you want.

```js
var flow = new DataFlow({name: "our flow"});
```

This can be important by reporting error. It is easier to find a faulty flow when it has a unique name.

####  Reading and writing data

Reading data from an empty flow is not possible.

```js
flow.read(); // NoDataAvailable: No data available on our flow.
```

So to read data first you need to write data.

```js
flow.write(123);
console.log(flow.read()); // 123
```

By reading the data, the flow releases it, so you won't be able to read it again unless you write it back.

#### Awaiting data

When you don't know whether the data already arrived or not, but you want to avoid reading an empty flow, you need to use the await method.

```js
flow.await(function (data){
    console.log(data);
});
```

If there is data on the flow, it will be sent to the callback, otherwise next time data is written, the callback will get it.

```js
flow.write(123); // 123
```

If you have more data, you can write it on the flow, it won't do anything, since await is the async synonym of a single read.

#### Pushing data

To add a permanent data reader, you need to listen to the `pushed` event.

```js
flow.on("pushed", function (flow){
    console.log(flow.read());
});
```

To trigger this event, you need to push to the flow, so a simple write is not enough.

```js
flow.write(123);
flow.push(456); // 123
flow.push(789); // 456
```

As you can see the messages are processed in write order, so if you push data it is possible that the listener will get something completely different from the flow.

#### Pulling data

Sometimes pushing is not enough, because the reader wants to decide when it needs the data to be generated. In such situations we need to use pull.

```js
flow.pull(function (data){
    console.log(data);
});
```

It works the same way as await, so you can give it a callback and wait for data to be arrived. Data won't come from thing air, so we need to write it manually.

```js
flow.write(123); // 123
```

To make a permanent data generator for pull requests you need to use the `pulled` event.

```js
var i = 0
flow.on("pulled", function (flow){
    flow.write(++i);
});

flow.pull(console.log); // 1
flow.pull(console.log); // 2
flow.pull(console.log); // 3
```

Ofc. this is not as fancy as iterating a real generator, but it is good when you want to read for example chunks one by one from a stream.

## License

MIT - 2014 Jánszky László Lajos