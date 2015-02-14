var df = require("dflo2"),
    Plugin = df.Plugin,
    Base = df.Base,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration,
    id = df.id;


var Publisher = Base.extend({
    id: undefined,
    subscriptions: undefined,
    wrapper: undefined,
    init: function (options, preprocessor) {
        this.id = id();
        this.subscriptions = {};
        this.configure(options, preprocessor);
    },
    addSubscription: function (subscription) {
        if (!(subscription instanceof Subscription))
            throw new Publisher.SubscriptionRequired();
        this.subscriptions[subscription.id] = subscription;
    },
    publish: function (parameters) {
        if (!(parameters instanceof Array))
            throw new Publisher.ArrayRequired();
        for (var id in this.subscriptions) {
            var subscription = this.subscriptions[id];
            subscription.notify(parameters);
        }
    },
    wrap: function () {
        if (this.wrapper)
            return this.wrapper;
        var publisher = this;
        this.wrapper = function () {
            var parameters = Array.prototype.slice.call(arguments);
            publisher.publish(parameters);
        };
        this.wrapper.publisher = this;
        return this.wrapper;
    }
}, {
    ArrayRequired: InvalidArguments.extend({
        message: "Array of arguments required."
    }),
    SubscriptionRequired: InvalidArguments.extend({
        message: "Subscription instance required."
    })
});

var Subscription = Base.extend({
    id: undefined,
    publisher: undefined,
    subscriber: undefined,
    init: function (options, preprocessor) {
        this.id = id();
        this.configure(options, preprocessor);
        if (!(this.publisher instanceof Publisher))
            throw new Subscription.PublisherRequired();
        if (!(this.subscriber instanceof Subscriber))
            throw new Subscription.SubscriberRequired();
        this.publisher.addSubscription(this);
    },
    notify: function (parameters) {
        if (!(parameters instanceof Array))
            throw new Subscription.ArrayRequired();
        this.subscriber.receive(parameters);
    }
}, {
    PublisherRequired: InvalidConfiguration.extend({
        message: "Publisher instance required."
    }),
    SubscriberRequired: InvalidConfiguration.extend({
        message: "Subscriber instance required."
    }),
    ArrayRequired: InvalidArguments.extend({
        message: "Array of arguments required."
    })
});

var Subscriber = Base.extend({
    id: undefined,
    init: function (options, preprocessor) {
        this.id = id();
        this.configure(options, preprocessor);
        if (!(this.callback instanceof Function))
            throw new Subscriber.CallbackRequired();
    },
    receive: function (parameters) {
        this.callback.apply(null, parameters);
    },
    subscribe: function (publisher) {
        if (!arguments.length)
            throw new InvalidArguments.Empty();
        if (arguments.length > 1)
            throw new InvalidArguments();
        return Subscription.instance(publisher, this);
    }
}, {
    CallbackRequired: InvalidConfiguration.extend({
        message: "Callback function required."
    })
});

module.exports = new Plugin({
    Publisher: Publisher,
    Subscription: Subscription,
    Subscriber: Subscriber,
    test: function () {
    },
    setup: function () {
        var o = {
            Publisher: Publisher,
            Subscription: Subscription,
            Subscriber: Subscriber
        };

        for (var p in o) {
            df[p] = o[p];
        }
    }
});