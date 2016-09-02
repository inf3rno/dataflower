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

This can be important by error reporting. It is easier to find a faulty flow when it has a unique name.

####  Reading and writing data

Reading data from a dry flow is not possible.

```js
flow.read(); // DryRead: Attempting to read our flow while it was dry.
```

So to read data first you need to write data.

```js
flow.write(123);
console.log(flow.read()); // 123
```

By reading the data, the flow releases it, so you won't be able to read it again unless you write it back.

#### Awaiting data

When you don't know whether the data already arrived or not, but you want to avoid reading a dry flow, you need to use the await method.

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

#### Loops

To sustain flows, you always need a loop, which transfers the data from a data source to a data sink.

The simplest source uses a `while` or a `for` loop to generate and push the data.

```js
flow.on("pushed", function () {
    console.log(flow.read());
});

var i = 0;
while (i < 5)
    flow.push(i++);

for (; i < 10; i++)
    flow.push(i);
```

If you need an async loop then you should use a recursive function or an interval.

```js
flow.on("pushed", function () {
    console.log(flow.read());
});

var i = 0;
var interval = setInterval(function () {
    flow.push(i++);
    if (i == 10)
        clearInterval(interval);
}, 100);
```

You can use a flow as a data source, if it can be pulled.

```js
var reader = new FileReader("source.txt"),
    writer = new FileWriter("destination.txt");
reader.pull(function next(line) {
    writer.write(line);
    if (reader.isExhausted()) {
        reader.close();
        writer.close();
    }
    else
        reader.pull(next);
});
```

#### Flow draining and exhaustion

I already mentioned that you cannot read dry flows. Dry means that there is no data on the flow currently.

```js
flow.write(1);
console.log(flow.isDry()); // false
flow.read();
console.log(flow.isDry()); // true
flow.read(); // DryRead: Attempting to read our flow while it was dry.
```

You can always write data on a dry flow, so it can be read again.

Exhausted flow means that all of the data is already written to the flow, and there won't be more. If you try to write more, you will end up with an error.

```js
flow.write(1);
flow.write(2);
console.log(flow.isExhausted()); // false
flow.exhaust();
console.log(flow.isExhausted()); // true
console.log(flow.isDry()); // false
flow.write(3); // ExhaustedWrite: Attempting to write our flow after it was exhausted.
```

You can still read, await or pull an exhausted flow until it gets dry.

If you try to await a dry and exhausted flow, then you will get an error.

```js
flow.exhaust();
flow.await(function (){}); // ExhaustedDryAwait: Attempting to await our flow while it was exhausted and dry.
```

The same happens when you await a flow and it gets exhausted meanwhile.

```js
flow.await(function (){});
flow.await(function (){});
flow.write(1);
flow.exhaust(); // ExhaustedDryAwait: Attempting to await our flow while it was exhausted and dry.
```

## License

MIT - 2014 Jánszky László Lajos