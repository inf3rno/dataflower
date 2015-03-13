var df = require("dataflower"),
    Plugin = df.Plugin,
    Base = df.Base,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration,
    Wrapper = df.Wrapper,
    clone = df.clone,
    watch = df.watch,
    HashSet = df.HashSet,
    deepMerge = df.deepMerge,
    toArray = df.toArray;

var Subscription = HashSet.extend({
    context: undefined,
    init: function () {
        this.build();
        this.merge.apply(this, arguments);
        this.configure();
    },
    merge: function (source) {
        return deepMerge(this, toArray(arguments), {
            items: function (subscription, items) {
                if (!(items instanceof Array))
                    throw new Subscription.ItemsRequired();
                subscription.addAll.apply(subscription, items);
            }
        });
    },
    configure: function () {
    },
    notify: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Subscription.ArrayRequired();
        for (var id in this.items) {
            var item = this.items[id];
            if (item instanceof Subscriber)
                item.receive(parameters, this.context || context);
        }
    },
    add: function (item) {
        HashSet.prototype.add.apply(this, arguments);
        item.subscriptions.add(this);
        return this;
    },
    remove: function (item) {
        HashSet.prototype.remove.apply(this, arguments);
        item.subscriptions.remove(this);
        return this;
    },
    hashCode: function (item) {
        if (!arguments.length)
            throw new InvalidArguments.Empty();
        if (arguments.length > 1)
            throw new InvalidArguments();
        if (!(item instanceof Component))
            throw new Subscription.ComponentRequired();
        return item.id;
    }
}, {
    ItemsRequired: InvalidConfiguration.extend({
        message: "An Array of Components required as items."
    }),
    ComponentRequired: InvalidArguments.extend({
        message: "Component required."
    }),
    ArrayRequired: InvalidArguments.extend({
        message: "Array of arguments required."
    })
});

var Component = Base.extend({
    subscriptions: undefined,
    wrapper: undefined,
    configure: function () {
        this.subscriptions = new HashSet();
    },
    toFunction: function () {
        if (!this.wrapper) {
            var component = this;
            var properties = {
                component: this
            };
            for (var property in this)
                if (this[property] instanceof Component)
                    properties[property] = this[property].toFunction();
            this.wrapper = new Wrapper({
                done: function () {
                    return component.handleWrapper(toArray(arguments), this);
                },
                properties: properties
            }).toFunction();
        }
        return this.wrapper;
    },
    handleWrapper: function (parameters, context) {
    }
}, {
    SubscriptionRequired: InvalidArguments.extend({
        message: "Subscription instance required."
    })
});

var Publisher = Component.extend({
    handleWrapper: function (parameters, context) {
        return this.publish(parameters, context);
    },
    publish: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Publisher.ArrayRequired();
        for (var id in this.subscriptions.items) {
            var subscription = this.subscriptions.items[id];
            subscription.notify(parameters, context);
        }
    }
}, {
    ArrayRequired: InvalidArguments.extend({
        message: "Array of arguments required."
    })
});

var Subscriber = Component.extend({
    callback: undefined,
    configure: function () {
        if (!(this.callback instanceof Function))
            throw new Subscriber.CallbackRequired();
        Component.prototype.configure.call(this);
    },
    handleWrapper: function (parameters, context) {
        return this.receive(parameters, context);
    },
    receive: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Subscriber.ArrayRequired();
        this.callback.apply(context, parameters);
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
    configure: function () {
        Publisher.prototype.configure.call(this);
        if (!(this.subject instanceof Object))
            throw new Listener.SubjectRequired();
        if (typeof(this.event) != "string")
            throw new Listener.EventRequired();
        this.subject.on(this.event, this.toFunction());
    },
    publish: function (parameters, context) {
        Publisher.prototype.publish.call(this, parameters, this.subject);
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
    configure: function () {
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
        Subscriber.prototype.configure.call(this);
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
    configure: function () {
        Publisher.prototype.configure.call(this);
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
        Publisher.prototype.publish.call(this, parameters, this.subject);
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
    configure: function () {
        if (!(this.subject instanceof Object))
            throw new Setter.SubjectRequired();
        if (typeof(this.property) != "string")
            throw new Setter.PropertyRequired();
        this.callback = function (value) {
            this.subject[this.property] = value;
        }.bind(this);
        Subscriber.prototype.configure.call(this);
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
    configure: function () {
        Publisher.prototype.configure.call(this);
        if (!(this.subject instanceof Object))
            throw new Watcher.SubjectRequired();
        if (typeof(this.property) != "string")
            throw new Watcher.PropertyRequired();
        watch(this.subject, this.property, this.toFunction());
    },
    publish: function (parameters, context) {
        Publisher.prototype.publish.call(this, parameters, this.subject);
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
    called: undefined,
    done: undefined,
    error: undefined,
    configure: function () {
        Subscriber.prototype.configure.call(this);
        this.called = new Publisher();
        this.done = new Publisher();
        this.error = new Publisher();
    },
    receive: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Task.ArrayRequired();
        this.called.publish(parameters, context);
        parameters = clone(parameters);
        parameters.unshift(function (error, results) {
            var publisher = this.error,
                parameters = toArray(arguments);
            if (!error) {
                publisher = this.done;
                parameters.shift();
            }
            publisher.publish(parameters, context);
        }.bind(this));
        this.callback.apply(context, parameters);
    }
});

var Spy = Subscriber.extend({
    called: undefined,
    done: undefined,
    error: undefined,
    configure: function () {
        Subscriber.prototype.configure.call(this);
        this.called = new Publisher();
        this.done = new Publisher();
        this.error = new Publisher();
    },
    receive: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Spy.ArrayRequired();
        this.called.publish(parameters, context);
        try {
            var result = this.callback.apply(context, parameters);
        }
        catch (error) {
            this.error.publish([error], context);
            throw error;
        }
        this.done.publish([result], context);
        return result;
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
    Task: Task,
    Spy: Spy
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