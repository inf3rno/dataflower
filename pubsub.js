var df = require("dataflower"),
    Plugin = df.Plugin,
    Base = df.Base,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration,
    Wrapper = df.Wrapper,
    clone = df.clone,
    watch = df.watch,
    HashSet = df.HashSet,
    toArray = df.toArray,
    deep = df.deep;

var ComponentSet = HashSet.extend({
    hashCode: function (item) {
        if (!(item instanceof Component))
            throw new ComponentSet.ComponentRequired();
        return item.id;
    }
}, {
    ComponentRequired: InvalidArguments.extend({
        message: "Component required."
    })
});

var Component = Base.extend({
    flows: new ComponentSet(),
    wrapper: undefined,
    build: function () {
        return deep(this, this, {
            property: {
                flows: function (component, flows) {
                    component.flows = new ComponentSet();
                    component.addAll.apply(component, flows.toArray());
                }
            }
        });
    },
    merge: function (source) {
        for (var index in arguments)
            deep(this, arguments[index], {
                property: {
                    flows: function (component, flows) {
                        if (!(flows instanceof Array))
                            throw new Component.ItemsRequired();
                        component.addAll.apply(component, flows);
                    }
                },
                defaultProperty: function (component, value) {
                    return value;
                }
            }, [index]);
        return this;
    },
    activate: function (parameters, context) {
        if (!(parameters instanceof Array))
            throw new Component.ArrayRequired();
    },
    addAll: ComponentSet.prototype.addAll,
    add: function (item) {
        this.flows.add(item);
        item.flows.add(this);
        return this;
    },
    removeAll: ComponentSet.prototype.removeAll,
    remove: function (item) {
        this.flows.remove(item);
        item.flows.remove(this);
        return this;
    },
    clear: function () {
        return this.removeAll.apply(this, this.toArray());
    },
    containsAll: ComponentSet.prototype.containsAll,
    contains: function (item) {
        return this.flows.contains(item);
    },
    toArray: function () {
        return this.flows.toArray();
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
                    return component.activate(toArray(arguments), this);
                },
                properties: properties
            }).toFunction();
        }
        return this.wrapper;
    }
}, {
    ItemsRequired: InvalidConfiguration.extend({
        message: "An Array of Components required as items."
    }),
    ArrayRequired: InvalidArguments.extend({
        message: "Array of arguments required."
    })
});

var Publisher = Component.extend({
    publish: function (parameters, context) {
        return this.activate(parameters, context);
    },
    activate: function (parameters, context) {
        Component.prototype.activate.apply(this, arguments);
        for (var id in this.flows.items) {
            var component = this.flows.items[id];
            if (!(component instanceof Publisher))
                component.activate(parameters, context);
        }
    }
});

var Subscriber = Component.extend({
    callback: undefined,
    configure: function () {
        if (!(this.callback instanceof Function))
            throw new Subscriber.CallbackRequired();
    },
    receive: function (parameters, context) {
        return this.activate.apply(this, arguments);
    },
    activate: function (parameters, context) {
        Component.prototype.activate.apply(this, arguments);
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

var Subscription = Component.extend({
    context: undefined,
    notify: function (parameters, context) {
        return this.activate.apply(this, arguments);
    },
    activate: function (parameters, context) {
        Component.prototype.activate.apply(this, arguments);
        for (var id in this.flows.items) {
            var component = this.flows.items[id];
            if (component instanceof Subscriber)
                component.activate(parameters, this.context || context);
        }
    }
});

var Listener = Publisher.extend({
    subject: undefined,
    event: undefined,
    configure: function () {
        if (!(this.subject instanceof Object))
            throw new Listener.SubjectRequired();
        if (typeof(this.event) != "string")
            throw new Listener.EventRequired();
        this.subject.on(this.event, this.toFunction());
    },
    activate: function (parameters, context) {
        Publisher.prototype.activate.call(this, parameters, this.subject);
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
        if (!(this.subject instanceof Object))
            throw new Getter.SubjectRequired();
        if (typeof(this.property) != "string")
            throw new Getter.PropertyRequired();
    },
    activate: function (parameters, context) {
        Component.prototype.activate.apply(this, arguments);
        parameters = clone(parameters);
        parameters.unshift(this.subject[this.property]);
        Publisher.prototype.activate.call(this, parameters, this.subject);
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
        if (!(this.subject instanceof Object))
            throw new Watcher.SubjectRequired();
        if (typeof(this.property) != "string")
            throw new Watcher.PropertyRequired();
        watch(this.subject, this.property, this.toFunction());
    },
    activate: function (parameters, context) {
        Publisher.prototype.activate.call(this, parameters, this.subject);
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
    activate: function (parameters, context) {
        Component.prototype.activate.apply(this, arguments);
        this.called.activate(parameters, context);
        parameters = clone(parameters);
        parameters.unshift(function (error, results) {
            var publisher = this.error,
                parameters = toArray(arguments);
            if (!error) {
                publisher = this.done;
                parameters.shift();
            }
            publisher.activate(parameters, context);
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
    activate: function (parameters, context) {
        Component.prototype.activate.apply(this, arguments);
        this.called.activate(parameters, context);
        try {
            var result = this.callback.apply(context, parameters);
        }
        catch (error) {
            this.error.activate([error], context);
            throw error;
        }
        this.done.activate([result], context);
        return result;
    }
});

var o = {
    ComponentSet: ComponentSet,
    Component: Component,
    Publisher: Publisher,
    Subscriber: Subscriber,
    Subscription: Subscription,
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