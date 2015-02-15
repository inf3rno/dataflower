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
    preprocessors: [
        function (instance) {
            var Publisher = this;
            if ((instance instanceof Function) && (instance.publisher instanceof Publisher))
                return [instance.publisher];
            return arguments;
        }
    ],
    done: function (options) {
        var Publisher = this;
        if (arguments.length > 1)
            throw new InvalidArguments();
        if (arguments.length == 0)
            return new Publisher();
        if (options instanceof Publisher)
            return options;
        if (!Base.prototype.isOptions(options))
            throw new InvalidArguments();
        return new Publisher(options);
    }
}).wrap();

var subscriptionContainer = new Wrapper({
    preprocessors: [
        function (publisher, subscriber) {
            if (arguments.length != 2)
                return arguments;
            return [{
                publisher: publisher,
                subscriber: subscriber
            }];
        }
    ],
    done: function (options) {
        var Subscription = this;
        if (!arguments.length)
            throw new InvalidArguments.Empty();
        if (arguments.length > 1)
            throw new InvalidArguments();
        if (options instanceof Subscription)
            return options;
        if (!Base.prototype.isOptions(options))
            throw new InvalidArguments();
        options.publisher = Publisher.instance(options.publisher);
        options.subscriber = Subscriber.instance(options.subscriber);
        return new Subscription(options);
    }
}).wrap();

var subscriberContainer = new Wrapper({
    done: function (options) {
        var Subscriber = this;
        if (arguments.length == 0)
            throw new InvalidArguments.Empty();
        if (arguments.length > 1)
            throw new InvalidArguments();
        if (options instanceof Subscriber)
            return options;
        if (options instanceof Function)
            options = {
                callback: options
            };
        if (!Base.prototype.isOptions(options))
            throw new InvalidArguments();
        return new Subscriber(options);
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