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
    Flow = df.Flow,
    Pump = df.Pump;
```

### Flows

The main purpose of data flows is data delivery, but if you want you can use them for buffering data until somebody needs it.

Creating a flow is simple.

```js
var flow = new Flow();
```

But you cannot extract data from an unsustained flow

```js
flow.extract(); // DryExtract: Attempting to extract data from a dry flow.
```

So you need to sustain it somehow.

```js
flow.sustain(123);
console.log(flow.extract()); // 123
```

By extracting the data, the flow releases it, so you won't be able to extract it again.

You can check whether a flow is dry.

```js
while(!flow.isDry())
    console.log(flow.extract());
```

If you need to drain a flow, you don't have to write loops every time, you can use the drain method instead.

```js
console.log(flow.drain());
```

It will return always a data array.

If you want to stop a flow, then you can block it.

```js
flow.block();
console.log(flow.isBlocked()); // true
console.log(flow.isSustainable()); // false
```

After blocking the flow, you won't be able to sustain it again. All you can do is extracting the remaining data and removing the flow after that.

### Pumps

To use flows in an async way you need to use pumps. Creating a pump is simple as well.

```js
var pump = new Pump();
```

By default the pump creates a new flow, but you can inject an existing flow if you want.

```js
var pump = new Pump(flow);
```

You can always replace the current flow by overriding the flow property.

```js
pump.flow = newFlow;
```

```js
pump.merge({flow: newFlow});
```

#### Refresh and transactions

As I already mentioned the pump is for handling async code. That means it maintains a queue of callbacks, which you can add with await or pull.

These callbacks are called when data is available, but in order to notify them we need to refresh the pump.

```js
pump.await(function (){
    // console.log("called");
});
flow.sustain(1, 2, 3);
pump.refresh(); // called
```

Ofc. calling refresh manually is something not so convenient, that's why we need to use the transaction method.

```js
pump.await(function (){
    // console.log("called");
});
pump.transaction(function (theFlow){
    theFlow.sustain(1, 2, 3);
});
// called
```

Every Pump method with a callback (including await) runs in such a transaction, so they refresh the pump automatically.

That's why it is recommended to use these pump methods if you want the pump to work properly. If you are not able to do that, because you have multiple pumps on a single flow, then you need to call refresh manually.

#### Push - pushed - await loops

If you know there can be people waiting for your data, then you can sustain your flow with push. Push means, that you decide when you send the data.

```js
pump.await(function (flow){
    console.log(flow.extract());
});

pump.push(function (flow){
    flow.sustain(1);
});
```

You could do the same with a transaction, so how is push different?

It triggers a pushed event, which you can listen to. So if you want to be notified about arriving data permanently, then you can listen to this event.

```js
pump.on("pushed", function (flow){
    console.log(flow.drain());
});

pump.push(function (flow){
    flow.sustain(1, 2, 3);
});
```

The drain method uses a sync loop to extract all the available data from the flow. You can do it with an async loop too if you want to.

```js
pump.on("pushed", function (flow){
    flow.await(function next(flow){
        console.log(flow.extract());
        setTimeout(function (){
            if (!flow.isDry())
                flow.await(next);
        }, 10);
    });
});
```

Just be sure, that nobody else is extracting data from the flow parallel, because if the flow goes blocked, then unsustainable awaits will throw errors.

#### Pull - pulled loops

If you waited for data almost forever and nothing happened, that may be because you need to use pull instead of await. Pull means you decide when you get the data and the pump waits for a sign to start sustaining the flow.

```js
pump.pull(function (flow){
    console.log(flow.extract());
});
```

To start the process you need a pulled event handler on the pump.

```js
pump.on("pulled", function (flow){
    flow.sustain(Math.floor(Math.random() * 10));
    if (Math.random() < 0.1)
        flow.block();
});
```

You can call pull recursively to get a continuous data flow.

```js
pump.pull(function again(flow){
    console.log(flow.extract());
    if (flow.isSustainable())
        pump.pull(again);
});
```

This kind of solution can be very useful by handling for example file streams.

## License

MIT - 2014 Jánszky László Lajos