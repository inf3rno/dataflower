var df = require("dataflower"),
    Plugin = df.Plugin,
    Base = df.Base,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration,
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
    wrapper: undefined,
    init: function () {
        if (!(this.callback instanceof Function))
            throw new Subscriber.CallbackRequired();
    },
    receive: function (parameters, context) {
        this.callback.apply(context, parameters);
    },
    toFunction: function () {
        if (!this.wrapper) {
            var subscriber = this;
            this.wrapper = new Wrapper({
                done: function () {
                    var parameters = Array.prototype.slice.call(arguments);
                    subscriber.receive(parameters, this);
                },
                properties: {
                    component: this
                }
            }).toFunction();
        }
        return this.wrapper;
    }
}, {
    CallbackRequired: InvalidConfiguration.extend({
        message: "Callback function required."
    })
});

var Listener = Publisher.extend({
    subject: undefined,
    event: undefined,
    init: function () {
        Publisher.prototype.init.apply(this, arguments);
        if (!(this.subject instanceof Object))
            throw new Listener.SubjectRequired();
        if (typeof(this.event) != "string")
            throw new Listener.EventRequired();
        this.subject.on(this.event, this.toFunction());
    }
}, {
    SubjectRequired: InvalidConfiguration.extend({
        message: "Subject required."
    }),
    EventRequired: InvalidConfiguration.extend({
        message: "Event type required."
    })
});

var o = {
    Component: Component,
    Publisher: Publisher,
    Subscription: Subscription,
    Flow: Subscription,
    Subscriber: Subscriber,
    Listener: Listener
};

module.exports = new Plugin(o, {
    test: function () {
    },
    setup: function () {
        for (var p in o) {
            df[p] = o[p];
        }
    }
});