var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Plugin = df.Plugin,
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscription = ps.Subscription,
    Subscriber = ps.Subscriber,
    Wrapper = df.Wrapper;

var o = {
    publisher: new Wrapper({
        algorithm: Wrapper.algorithm.firstMatchCascade,
        preprocessors: [
            function () {
                if (arguments.length == 0)
                    return [new Publisher()];
            },
            function (wrapper) {
                if ((wrapper instanceof Function) && (wrapper.component instanceof Publisher))
                    return [wrapper.component];
            },
            function (options) {
                if ((options instanceof Object) && !(options instanceof Publisher))
                    return [new Publisher(options)];
            }
        ],
        done: function (publisher) {
            if (arguments.length > 1)
                throw new InvalidArguments();
            if (!(publisher instanceof Publisher))
                throw new InvalidArguments();
            return publisher.toFunction();
        }
    }).toFunction(),
    subscriber: new Wrapper({
        algorithm: Wrapper.algorithm.firstMatchCascade,
        preprocessors: [
            function (callback) {
                if (arguments.length == 1 && (callback instanceof Function))
                    return [{
                        callback: callback
                    }];
            },
            function (options) {
                if (arguments.length == 1 && (options instanceof Object) && !(options instanceof Subscriber))
                    return [new Subscriber(options)];
            }
        ],
        done: function (subscriber) {
            if (arguments.length == 0)
                throw new InvalidArguments.Empty();
            if (arguments.length > 1)
                throw new InvalidArguments();
            if (!(subscriber instanceof Subscriber))
                throw new InvalidArguments();
            return subscriber;
        }
    }).toFunction(),
    subscribe: new Wrapper({
        algorithm: Wrapper.algorithm.firstMatchCascade,
        preprocessors: [
            function (publisher, subscriber) {
                if (arguments.length == 2)
                    return [{
                        publisher: publisher,
                        subscriber: subscriber
                    }];
            },
            function (options) {
                if (arguments.length == 1 && (options instanceof Object) && !(options instanceof Subscription)) {
                    options.publisher = o.publisher(options.publisher).component;
                    options.subscriber = o.subscriber(options.subscriber);
                    return [new Subscription(options)];
                }
            }
        ],
        done: function (subscription) {
            if (!arguments.length)
                throw new InvalidArguments.Empty();
            if (arguments.length > 1)
                throw new InvalidArguments();
            if (!(subscription instanceof Subscription))
                throw new InvalidArguments();
            return subscription;
        }
    }).toFunction()
};
o.flow = o.subscribe;

module.exports = new Plugin({
    publisher: o.publisher,
    subscriber: o.subscriber,
    subscribe: o.subscribe,
    flow: o.flow,
    test: function () {
    },
    setup: function () {
        for (var p in o) {
            df[p] = o[p];
        }
    }
});