var df = require("dflo2"),
    ps = require("dflo2/pubsub"),
    Plugin = df.Plugin,
    Base = df.Base,
    Container = df.Container,
    InvalidArguments = df.InvalidArguments,
    Factory = df.Factory,
    Publisher = ps.Publisher,
    Subscription = ps.Subscription,
    Subscriber = ps.Subscriber;

var publisherContainer = new Container().add({
    factory: Factory.extend({
        create: function (Publisher, options) {
            if (arguments.length > 2)
                throw new InvalidArguments();
            if (arguments.length == 1)
                return new Publisher();
            if (!this.isOptions(options))
                throw new InvalidArguments();
            return new Publisher(options);
        }
    }).instance(),
    isDefault: true
}).add({
    factory: Factory.extend({
        create: function (Publisher, instance) {
            if (instance instanceof Publisher)
                return instance;
            if ((instance instanceof Function) && (instance.publisher instanceof Publisher))
                return instance.publisher;
        }
    }).instance()
}).wrap({
    passContext: true
});


var subscriptionContainer = new Container().add({
    factory: new Factory({
        create: function (Subscription, options) {
            if (arguments.length == 1)
                throw new InvalidArguments.Empty();
            if (arguments.length > 2)
                throw new InvalidArguments();
            if (!Base.prototype.isOptions(options))
                throw new InvalidArguments();
            options.publisher = Publisher.instance(options.publisher);
            options.subscriber = Subscriber.instance(options.subscriber);
            return new Subscription(options);
        }
    }),
    isDefault: true
}).add({
    factory: new Factory({
        create: function (Subscription, instance) {
            if (instance instanceof Subscription)
                return instance;
        }
    })
}).add({
    factory: new Factory({
        create: function (Subscription, publisher, subscriber) {
            if (arguments.length == 3)
                return Subscription.instance({
                    publisher: publisher,
                    subscriber: subscriber
                });
        }
    })
}).wrap({
    passContext: true
});

var subscriberContainer = new Container().add({
    factory: new Factory({
        create: function (Subscriber, options) {
            if (arguments.length == 1)
                throw new InvalidArguments.Empty();
            if (arguments.length > 2)
                throw new InvalidArguments();
            if (options instanceof Function)
                options = {
                    callback: options
                };
            if (!this.isOptions(options))
                throw new InvalidArguments();
            return new Subscriber(options);
        }
    }),
    isDefault: true
}).add({
    factory: new Factory({
        create: function (Subscriber, instance) {
            if (instance instanceof Subscriber)
                return instance;
        }
    })
}).wrap({
    passContext: true
});

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