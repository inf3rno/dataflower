# DataFlow project 2nd edition - dataflow islands for async coding in javascript

The main goal I want to achieve is bidirectional data binding between models and views in client side javascript. Meantime I realized, that
this is a part of something bigger; javascript has a poor support for async language statements. This is why the callback pyramid is still a
problem by async codes. Currently only `yield` is available to make async series, but nothing more. I studied many different topics which share this
common problem. A short list of them: pub/sub pattern, observer pattern, ZermoMQ, message queue, message bus, promises, the async
lib, routing by computer networks, neural networks, I/O automaton, actor-based programming, agent-based programming, and the noflo lib, which
is dataflow-based. At the end I came to the conclusion, that what I need is dataflow-based programming but only by the async parts of the code.
I don't think that everything is a nail, and dataflow-based patterns should be used as a golden hammer. In my opinion the
sync code of the components should be developed with plain old javascript and only the communication between them
should be solved with dataflow-based code islands.

## Examples

### 0. use module
```js
var df = require("dflo2/df");
```

### 1. inheritance, instantiation, configuration, cloning
```js
var Cat = df.Object.extend({
    init: function (name) {
        this.name = name;
        ++Cat.counter;
    },
    meow: function () {
        console.log(this.name + ": meow");
    }
}, {
    counter: 0,
    count: function () {
        return this.counter;
    }
});
```

```js
var kitty = new Cat("Kitty");
var killer = Cat.instance("Killer");

kitty.meow(); //Kitty: meow
killer.meow(); //Killer: meow

console.log(Cat.count()); //2
```

```js
kitty.configure({
    init: function (postfix) {
        this.name += " " + postfix;
    }
}, "Cat");
kitty.meow(); //Kitty Cat: meow

kitty.init("from London");
kitty.meow(); //Kitty Cat from London: meow
```

```js
var kittyClone = Cat.clone(kitty);
kittyClone.meow(); //Kitty Cat from London: meow
```

### 2. custom errors

```js
var CustomError = df.Error.extend({
    name: "CustomError"
});
var CustomErrorSubType = CustomError.extend({
    message: "Something really bad happened."
});
var AnotherSubType = CustomError.extend();

var err = new CustomErrorSubType();

// all true
console.log(
    err instanceof CustomErrorSubType,
    err instanceof CustomError,
    err instanceof df.Error,
    err instanceof Error
);

// all false
console.log(
    err instanceof AnotherSubType,
    err instanceof SyntaxError
);
```

```js
console.log(err.toString());
// CustomError Something really bad happened.

console.log(err.stack);
// prints the stack, something like:
/*
    CustomError Something really bad happened.
    at null.<anonymous> (/README.md:71:11)
    ...
*/

```

```js
try {
    throw err;
} catch (err) {

}
```

### 3. sequence, unique id

```js
var sequence = new df.Sequence({
    state: 10,
    generator: function (previousState) {
        return previousState + 1;
    }
});

console.log(sequence.state); //10
console.log(sequence.next()); //11
console.log(sequence.state); //11

var wrapper = sequence.wrap();

console.log(wrapper())); //12
console.log(wrapper.sequence.state); //12
```

```js
var id1 = df.uniqueId();
var id2 = df.uniqueId();

console.log(id1 != id2); //true
```

### 4. pub/sub pattern

```js
var publisher = new df.Publisher();
var subscription = new df.Subscription({
    publisher: publisher,
    subscriber: new df.Subscriber({
        callback: console.log
    })
});
publisher.publish([1, 2, 3]); // 1, 2, 3
publisher.publish([4, 5, 6]); // 4, 5, 6
```

## Documentation

The documentation is not yet available.

### Installation

Currently only copy-paste and node.js is available.

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