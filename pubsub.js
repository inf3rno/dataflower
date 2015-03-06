var df = require("dataflower"),
    Plugin = df.Plugin,
    Base = df.Base,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration,
    Wrapper = df.Wrapper,
    clone = df.clone,
    watch = df.watch;

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
    callback: undefined,
    wrapper: undefined,
    init: function () {
        if (!(this.callback instanceof Function))
            throw new Subscriber.CallbackRequired();
    },
    receive: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Subscriber.ArrayRequired();
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
    ArrayRequired: InvalidArguments.extend({
        message: "Array of arguments required."
    }),
    CallbackRequired: InvalidConfiguration.extend({
        message: "Callback function required."
    })
});

var Listener = Publisher.extend({
    subject: undefined,
    event: undefined,
    init: function () {
        Publisher.prototype.init.call(this);
        if (!(this.subject instanceof Object))
            throw new Listener.SubjectRequired();
        if (typeof(this.event) != "string")
            throw new Listener.EventRequired();
        this.subject.on(this.event, this.toFunction());
    },
    publish: function (parameters, context) {
        context = this.subject;
        Publisher.prototype.publish.call(this, parameters, context);
    }
}, {
    SubjectRequired: InvalidConfiguration.extend({
        message: "Subject required."
    }),
    EventRequired: InvalidConfiguration.extend({
        message: "Event type required."
    })
});

var Emitter = Subscriber.extend({
    subject: undefined,
    event: undefined,
    init: function () {
        if (!(this.subject instanceof Object))
            throw new Emitter.SubjectRequired();
        if (typeof(this.event) != "string")
            throw new Emitter.EventRequired();
        this.callback = function () {
            var parameters = [];
            parameters.push(this.event);
            parameters.push.apply(parameters, arguments);
            this.subject.emit.apply(this.subject, parameters);
        }.bind(this);
        Subscriber.prototype.init.call(this);
    }
}, {
    SubjectRequired: InvalidConfiguration.extend({
        message: "Subject required."
    }),
    EventRequired: InvalidConfiguration.extend({
        message: "Event type required."
    })
});

var Getter = Publisher.extend({
    subject: undefined,
    property: undefined,
    init: function () {
        Publisher.prototype.init.call(this);
        if (!(this.subject instanceof Object))
            throw new Getter.SubjectRequired();
        if (typeof(this.property) != "string")
            throw new Getter.PropertyRequired();
    },
    publish: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Publisher.ArrayRequired();
        parameters = clone(parameters);
        parameters.unshift(this.subject[this.property]);
        context = this.subject;
        Publisher.prototype.publish.call(this, parameters, context);
    }
}, {
    SubjectRequired: InvalidConfiguration.extend({
        message: "Subject required."
    }),
    PropertyRequired: InvalidConfiguration.extend({
        message: "Property name required."
    })
});

var Setter = Subscriber.extend({
    subject: undefined,
    property: undefined,
    init: function () {
        if (!(this.subject instanceof Object))
            throw new Setter.SubjectRequired();
        if (typeof(this.property) != "string")
            throw new Setter.PropertyRequired();
        this.callback = function (value) {
            this.subject[this.property] = value;
        }.bind(this);
        Subscriber.prototype.init.call(this);
    }
}, {
    SubjectRequired: InvalidConfiguration.extend({
        message: "Subject required."
    }),
    PropertyRequired: InvalidConfiguration.extend({
        message: "Property name required."
    })
});

var Watcher = Publisher.extend({
    init: function () {
        Publisher.prototype.init.call(this);
        if (!(this.subject instanceof Object))
            throw new Watcher.SubjectRequired();
        if (typeof(this.property) != "string")
            throw new Watcher.PropertyRequired();
        watch(this.subject, this.property, this.toFunction());
    },
    publish: function (parameters, context) {
        context = this.subject;
        Publisher.prototype.publish.call(this, parameters, context);
    }
}, {
    SubjectRequired: InvalidConfiguration.extend({
        message: "Subject required."
    }),
    PropertyRequired: InvalidConfiguration.extend({
        message: "Property name required."
    })
});

var Task = Subscriber.extend({
    done: undefined,
    error: undefined,
    init: function () {
        Subscriber.prototype.init.call(this);
        this.done = new Publisher();
        this.error = new Publisher();
    },
    receive: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Task.ArrayRequired();
        parameters = clone(parameters);
        parameters.unshift(function (error, results) {
            var publisher = this.error,
                parameters = Array.prototype.slice.call(arguments);
            if (!error) {
                publisher = this.done;
                parameters.shift();
            }
            publisher.publish(parameters, context);
        }.bind(this));
        this.callback.apply(context, parameters);
    },
    toFunction: function () {
        if (!this.wrapper) {
            var task = this;
            this.wrapper = new Wrapper({
                done: function () {
                    var parameters = Array.prototype.slice.call(arguments);
                    task.receive(parameters, this);
                },
                properties: {
                    component: this,
                    done: this.done.toFunction(),
                    error: this.error.toFunction()
                }
            }).toFunction();
        }
        return this.wrapper;
    }
});


var o = {
    Component: Component,
    Publisher: Publisher,
    Subscription: Subscription,
    Flow: Subscription,
    Subscriber: Subscriber,
    Listener: Listener,
    Emitter: Emitter,
    Getter: Getter,
    Setter: Setter,
    Watcher: Watcher,
    Task: Task
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