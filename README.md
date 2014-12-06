# DFlo project 2nd edition - dataflow islands for async coding in javascript

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

### Observer pattern

```js

    var Subject = df.Object.extend({
        init: function (state) {
            this.publisher = df.publisher();
            this.state = state;
            this.links = {};
        },
        changeState: function (state) {
            this.state = state;
            this.notifyObservers();
        },
        registerObserver: function (observer) {
            if (!this.links[observer.id])
                this.links[observer.id] = df.link(this.publisher, observer.subscriber);
        },
        unregisterObserver: function (observer) {
            if (this.links[observer.id]) {
                this.links[observer.id].disconnect();
                delete(this.links[observer.id]);
            }
        },
        notifyObservers: function () {
            this.publisher(this.state);
        }
    });

    var Observer = df.Object.extend({
        init: function () {
            this.id = df.uniqueId();
            this.subscriber = df.subscriber(this.notify, this);
        },
        notify: function (state) {
            this.state = state;
            console.log("change:state", "#"+this.id, this.state);
        }
    });

    var subject = new Subject();
    var observer1 = new Observer();
    var observer2 = new Observer();
    subject.registerObserver(observer1);
    subject.registerObserver(observer2);
    var newState = {a:1};
    subject.changeState(newState);
    //change:state #11 {a:1}
    //change:state #12 {a:1}
```

[The example code is available here as a jasmine test.](test/example.observer.spec.js)

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