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

## Documentation

A detailed documentation is not yet available.

### Examples

#### 0. use module
```js
var df = require("dflo2/df");
```

#### 1. inheritance, instantiation, configuration, cloning and unique id
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

```js
var id1 = df.id();
var id2 = df.id();

console.log(id1 != id2); //true
```

#### 2. container, factory, custom errors

```js
var Cat = df.Object.extend({
    color: undefined,
    name: undefined,
    init: function (options) {
        this.configure(options);
    },
    meow: function () {
        console.log("%s %s: meow", this.color, this.name);
    }
}, {
    instance: new df.Container().add({
        factory: df.Factory.extend({
            create: function (context, options) {
                if (arguments.length != 1)
                    throw new df.InvalidArguments();
                if (options.constructor !== Object)
                    throw new df.InvalidArguments();
                return new context(options);
            }
        }).instance(),
        isDefault: true
    }).wrap({
        passContext: true
    })
});

Cat.instance.container.add({
    factory: df.Factory.extend({
        create: function (context, color, name) {
            if (arguments.length != 3)
                return;
            return new context({
                color: color,
                name: name
            });
        }
    }).instance()
});

var kitty = Cat.instance({
    color: "orange",
    name: "Kitty"
});
var killer = Cat.instance("white", "Killer");
kitty.meow(); // orange Kitty: meow
killer.meow(); // white Killer: meow
```

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
    send: df.Publisher.instance().wrap(),
    receive: console.log
};
df.Subscription.instance(
    o.send.publisher,
    df.Subscriber.instance(o.receive)
);
o.send(1, 2, 3); // 1 2 3
o.send(4, 5, 6); // 4 5 6
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
df.subscriber(o.receive).subscribe(o.send);
o.send(1, 2, 3); // 1 2 3
o.send(4, 5, 6); // 4 5 6
```

### Installation

Node.js with manual copy & paste is available.
Npm and bower support will be available by 1.0.

#### Environment

An ES5 capable environment is required at least with

- `Object.create`
- `Object.defineProperty`

The framework is written for ES5.
There will be ES6 support in later 1.3+ versions after ES6 classes become prevalent.
Probably there won't be ES7 support, because it defines `async` functions, which will make this framework obsolete.

#### Testing

[Jasmine](https://github.com/jasmine/jasmine) 2.2 tests are available.

By node.js 0.10.36 I used [jasmine-npm](https://github.com/jasmine/jasmine-npm) 1.4.28.

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