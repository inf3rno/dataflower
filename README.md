# DataFlower - The dataflow project

[![Build Status](https://travis-ci.org/inf3rno/dataflower.png?branch=master)](https://travis-ci.org/inf3rno/dataflower)

The main goal I wanted to achieve is bidirectional data binding between models and views in client side javascript. Meantime I realized, this is a part of something much bigger; javascript has a poor support for async language statements. This is why the callback pyramid is still a problem by async codes.

Currently only `yield` is available in ES6 generators to make async series, but nothing more. ES7 will solve the problem, but who knows when will it be supported natively by browsers and node.js, which currently barely support ES6?! That's why I decided to address this issue, maybe I can do something to make things better.

I studied many different topics which share this common problem. A short list of them: pub/sub pattern, observer pattern, ZeroMQ, message queues, message bus, promises, the async
lib, routing by computer networks, neural networks, I/O automaton, actor-based programming, agent-based programming, and the noflo lib, which is dataflow-based. At the end I came to the conclusion; what I need is dataflow-based programming, but only by the async parts of the code. I don't think that everything is a nail, and dataflow-based patterns should be used as a golden hammer. In my opinion the sync code of the components should be developed with vanilla javascript and only the communication between them should be solved with dataflow-based code islands.

The projects concentrates on solving some general issues like inheritance, error handling, instantiation and after that it declares some nice classes, which can be used to build data flow graphs. The naming convention could have been easily something like graph - output - flow - input, but I think most of the developers are more familiar with network - publisher - subscription - subscriber, so after the alpha version of the project I decided to use the latter one. Please enjoy the flow based programming in javascript and if you find it useful, feel free to donate! :-)

## Pre-alpha Stage

> Pre-alpha refers to all activities performed during the software project before testing. These activities can include requirements analysis, software design, software development, and unit testing. In typical open source development, there are several types of pre-alpha versions. Milestone versions include specific sets of functions and are released as soon as the functionality is complete.

 - [wikipedia - Software release life cycle - Pre-alpha](http://en.wikipedia.org/wiki/Software_release_life_cycle#Pre-alpha)

**Most of the dataflow components are not yet implemented! I am working on the utils currently.**

## Documentation

A detailed documentation will be available on GitHub Pages by the first release. Until then all I can provide are low quality examples.

### Examples

#### 0. setting environment variables, installing plugins, testing

```bash
export NODE_PATH=../
# you should add the parent directory to NODE_PATH to support require("dataflower") by a local copy
# another possible solutions are npm link and symlink
```

```js
var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    psf = require("dataflower/pubsub.fluent"),
    v8 = require("dataflower/error.v8");

ps.install();
psf.install();

if (v8.compatible())
    v8.install();
```

#### 1. inheritance, instantiation, configuration, cloning and unique id
```js
var Cat = df.Base.extend({
    name: undefined,
    init: function () {
        if (typeof(this.name) != "string")
            throw new df.InvalidConfiguration("Invalid cat name.");
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
var kitty = new Cat({name: "Kitty"});
var killer = new Cat({name: "Killer"});

kitty.meow(); //Kitty: meow
killer.meow(); //Killer: meow

console.log(Cat.count()); //2
```

```js
kitty.mixin(
    init: function (postfix) {
        this.name += " " + postfix;
    }
);
kitty.init("Cat");
kitty.meow(); //Kitty Cat: meow

kitty.init("from London");
kitty.meow(); //Kitty Cat from London: meow
```

```js
var kittyClone = clone(kitty);
kittyClone.meow(); //Kitty Cat from London: meow
```

```js
var id1 = df.id();
var id2 = df.id();

console.log(id1 != id2); //true
```

#### 2. wrapper, custom errors, plugins

```js
var o = {
    m: function (a, b, c){
        console.log("processing", a, b, c);
        return [a, b, c];
    }
};
o.m = new df.Wrapper({
    algorithm: Wrapper.algorithm.cascade,
    preprocessors: [
        function (a, b, c) {
            console.log("reversing", a, b, c);
            return [c, b, a];
        }
    ],
    done: o.m
}).toFunction();
console.log("results", o.m(1, 2, 3))
// reversing [1, 2, 3]
// processing [3, 2, 1]
// results [3, 2, 1]
```

```js
var CustomError = df.UserError.extend({
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
    err instanceof df.UserError,
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

```js
try {
    try {
        throw new df.UserError("Something really bad happened.");
    }
    catch (cause) {
        throw new df.CompositeError({
            message: "Something really bad caused this.",
            myCause: cause
        });
    }
catch (composite) {
    console.log(err.toString());
    // CompositeError Something really bad caused this.

    console.log(err.stack);
    // prints the stack, something like:
    /*
        CompositeError Something really bad caused this.
            at null.<anonymous> (/README.md:71:11)
            ...
        caused by <myCause> UserError Something really bad happened.
            at null.<anonymous> (/README.md:68:9)
            ...
    */
}
```

```js
var plugin = new df.Plugin({
    test: function () {
        throw new Error();
    },
    setup: function () {
        console.log("Installing plugin.");
    }
});

if (plugin.compatible())
    plugin.install(); // won't install because of failing test

console.log(plugin.installed); //false
```

```js
var dependency = require("dependency");
var plugin = new df.Plugin({
    //...
});
plugin.dependency(dependency);
plugin.install(); // installs dependency before setup
```

#### 3. pub/sub pattern

```js
var publisher = new df.Publisher();
new df.Subscription({
    publisher: publisher,
    subscriber: new df.Subscriber({
        callback: console.log
    })
});
publisher.publish([1, 2, 3]); // 1 2 3
publisher.publish([4, 5, 6]); // 4 5 6
```

```js
var o = {
    send: df.publisher(),
    receive: console.log
};
df.subscribe(o.send, o.receive);
o.send(1, 2, 3); // 1 2 3
o.send(4, 5, 6); // 4 5 6
```

```js
var o = {
    send: df.publisher(),
    receive: console.log
};
df.subscriber(o.receive).subscribe(o.send.component);
o.send(1, 2, 3); // 1 2 3
o.send(4, 5, 6); // 4 5 6
```

### Installation

Node.js with manual copy & paste is available.
Npm and bower support will be available by 1.0.

#### Versioning

I decided to not give version numbers until the implementation reaches 0.9. You can follow the progress in the issue tracker. I write a low, so watching the repo is not a good idea if you don't want to get about 10 emails daily.
I could add auto-versioning by using git branches, but my experience that by a single developer project branching only slows me down. After version 1.0 (or probably later) I'll add branching and auto-versioning.

#### Environment

An ES5 capable environment is required at least with

- `Object.create`
- `Object.defineProperty`

There is an environment test available in the spec folder.

The framework is written for ES5.
There will be ES6 support in later 1.3+ versions after ES6 classes become prevalent.
Probably there won't be ES7 support, because it defines `async` functions, which will make this framework obsolete.

#### Testing

[Jasmine](https://github.com/jasmine/jasmine) 2.2 tests are available.

By node.js 0.10.36 I used [jasmine-npm](https://github.com/jasmine/jasmine-npm) 2.2.0.

By browsers I will use [karma](https://github.com/karma-runner/karma) x.x.x & [karma-jasmine](https://github.com/karma-runner/karma-jasmine) x.x.x.
Browser tests will be available by 1.1 and data binding tests will be available by 1.2.

There will be a DataFlow specific Jasmine helper available by 1.1.
Probably integration with other testing frameworks will be supported as well by 1.1.

#### Code completion

[WebStorm](https://www.jetbrains.com/webstorm/) support will be available by 1.1.
Probably other IDEs and editors will be supported in later 1.3+ versions.


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