var df = require("dflo2"),
    ps = require("dflo2/pubsub"),
    Plugin = df.Plugin,
    Base = df.Base,
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscription = ps.Subscription,
    Subscriber = ps.Subscriber,
    Wrapper = df.Wrapper;

var publisherContainer = new Wrapper({
    algorithm: Wrapper.algorithm.firstMatchCascade,
    preprocessors: [
        function () {
            var Publisher = this;
            if (arguments.length == 0)
                return [new Publisher()];
        },
        function (wrapper) {
            var Publisher = this;
            if ((wrapper instanceof Function) && (wrapper.component instanceof Publisher))
                return [wrapper.component];
        },
        function (options) {
            var Publisher = this;
            if (Base.prototype.isOptions(options))
                return [new Publisher(options)];
        }
    ],
    done: function (publisher) {
        var Publisher = this;
        if (arguments.length > 1)
            throw new InvalidArguments();
        if (!(publisher instanceof Publisher))
            throw new InvalidArguments();
        return publisher;
    }
}).wrap();

var subscriptionContainer = new Wrapper({
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
            var Subscription = this;
            if (arguments.length == 1 && Base.prototype.isOptions(options)) {
                options.publisher = Publisher.instance(options.publisher);
                options.subscriber = Subscriber.instance(options.subscriber);
                return [new Subscription(options)];
            }
        }
    ],
    done: function (subscription) {
        var Subscription = this;
        if (!arguments.length)
            throw new InvalidArguments.Empty();
        if (arguments.length > 1)
            throw new InvalidArguments();
        if (!(subscription instanceof Subscription))
            throw new InvalidArguments();
        return subscription;
    }
}).wrap();

var subscriberContainer = new Wrapper({
    algorithm: Wrapper.algorithm.firstMatchCascade,
    preprocessors: [
        function (callback) {
            if (arguments.length == 1 && (callback instanceof Function))
                return [{
                    callback: callback
                }];
        },
        function (options) {
            var Subscriber = this;
            if (arguments.length == 1 && Base.prototype.isOptions(options))
                return [new Subscriber(options)];
        }
    ],
    done: function (subscriber) {
        var Subscriber = this;
        if (arguments.length == 0)
            throw new InvalidArguments.Empty();
        if (arguments.length > 1)
            throw new InvalidArguments();
        if (!(subscriber instanceof Subscriber))
            throw new InvalidArguments();
        return subscriber;
    }
}).wrap();

var o = {
    publisher: function () {
        var publisher = Publisher.instance.apply(Publisher, arguments);
        return publisher.wrap();
    },
    subscriber: function () {
        return Subscriber.instance.apply(Subscriber, arguments);
    },
    subscribe: function () {
        return Subscription.instance.apply(Subscription, arguments);
    }
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
        Publisher.instance = publisherContainer;
        Subscription.instance = subscriptionContainer;
        Subscriber.instance = subscriberContainer;

        for (var p in o) {
            df[p] = o[p];
        }
    }
});