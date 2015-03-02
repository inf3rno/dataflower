var df = require("dataflower"),
    Plugin = df.Plugin,
    Base = df.Base,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration,
    id = df.id,
    Wrapper = df.Wrapper;

var Component = Base.extend();

var Publisher = Component.extend({
    subscriptions: undefined,
    wrapper: undefined,
    init: function () {
        this.subscriptions = {};
    },
    addSubscription: function (subscription) {
        if (!(subscription instanceof Subscription))
            throw new Publisher.SubscriptionRequired();
        this.subscriptions[subscription.id] = subscription;
    },
    publish: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Publisher.ArrayRequired();
        for (var id in this.subscriptions) {
            var subscription = this.subscriptions[id];
            subscription.notify(parameters, context);
        }
    },
    toFunction: function () {
        if (!this.wrapper) {
            var publisher = this;
            this.wrapper = new Wrapper({
                done: function () {
                    var parameters = Array.prototype.slice.call(arguments);
                    publisher.publish(parameters, this);
                },
                properties: {
                    component: this
                }
            }).toFunction();
        }
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
    context: undefined,
    init: function () {
        if (!(this.publisher instanceof Publisher))
            throw new Subscription.PublisherRequired();
        if (!(this.subscriber instanceof Subscriber))
            throw new Subscription.SubscriberRequired();
        this.publisher.addSubscription(this);
    },
    notify: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Subscription.ArrayRequired();
        this.subscriber.receive(parameters, this.context || context);
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

var Subscriber = Component.extend({
    id: undefined,
    callback: undefined,
    context: undefined,
    init: function () {
        if (!(this.callback instanceof Function))
            throw new Subscriber.CallbackRequired();
        if (this.context !== undefined && !(this.context instanceof Object))
            throw new Subscriber.InvalidContext();
    },
    receive: function (parameters, context) {
        this.callback.apply(context, parameters);
    },
    subscribe: function (publisher) {
        if (!arguments.length)
            throw new InvalidArguments.Empty();
        if (arguments.length > 1)
            throw new InvalidArguments();
        return new Subscription({
            publisher: publisher,
            subscriber: this
        });
    }
}, {
    CallbackRequired: InvalidConfiguration.extend({
        message: "Callback function required."
    }),
    InvalidContext: InvalidConfiguration.extend({
        message: "Object instance required."
    })
});

module.exports = new Plugin({
    Component: Component,
    Publisher: Publisher,
    Subscription: Subscription,
    Flow: Subscription,
    Subscriber: Subscriber,
    test: function () {
    },
    setup: function () {
        var o = {
            Component: Component,
            Publisher: Publisher,
            Subscription: Subscription,
            Flow: Subscription,
            Subscriber: Subscriber
        };

        for (var p in o) {
            df[p] = o[p];
        }
    }
});