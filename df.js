module.exports = (function (NativeObject, NativeError) {

    var extend = function (Ancestor, properties, staticProperties) {
        var Descendant = function () {
            if (this.init instanceof Function)
                this.init.apply(this, arguments);
        };
        Descendant.prototype = NativeObject.create(Ancestor.prototype);
        if (properties)
            for (var property in properties)
                Descendant.prototype[property] = properties[property];
        Descendant.prototype.constructor = Descendant;
        for (var staticProperty in Ancestor)
            Descendant[staticProperty] = Ancestor[staticProperty];
        if (staticProperties)
            for (var staticProperty in staticProperties)
                Descendant[staticProperty] = staticProperties[staticProperty];
        return Descendant;
    };

    var Object = extend(NativeObject, {
        configure: function (options) {
            if (!this.isOptions(options))
                return;
            for (var property in options)
                this[property] = options[property];
            if (!options.init)
                return;
            var args = Array.prototype.slice.call(arguments, 1);
            if (args.length == 1) {
                if (args[0] instanceof Array)
                    args = args[0];
                else if (typeof(args[0]) == typeof (arguments) && !isNaN(args[0].length))
                    args = args[0];
            }
            this.init.apply(this, args);
        },
        isOptions: function (options) {
            return !!options && options.constructor === NativeObject;
        }
    }, {
        instance: function () {
            var instance = NativeObject.create(this.prototype);
            this.apply(instance, arguments);
            return instance;
        },
        clone: function (instance) {
            var Class = instance.constructor;
            if (Class !== Object && (Class.prototype instanceof Object) && Class.clone !== Object.clone)
                return Class.clone(instance);
            return NativeObject.create(instance);
        },
        extend: function (properties, staticProperties) {
            return extend(this, properties, staticProperties);
        }
    });

    var id = function () {
        return ++id.last;
    };
    id.last = 0;

    var Factory = Object.extend({
        init: function (options) {
            this.configure(options);
        },
        create: function () {
        }
    });

    var Container = Factory.extend({
        factories: undefined,
        defaultFactories: undefined,
        init: function (options) {
            Factory.prototype.init.call(this, options);
            this.factories = [];
            this.defaultFactories = [];
        },
        add: function (factory, isDefault) {
            var options = {
                factory: factory,
                isDefault: isDefault
            };
            if (this.isOptions(factory))
                options = factory;
            if (!(options.factory instanceof Factory))
                throw new Container.FactoryRequired();
            var factories = this.factories;
            if (options.isDefault)
                factories = this.defaultFactories;
            factories.push(options.factory);
            return this;
        },
        wrap: function () {
            var options = {
                pass: Array.prototype.slice.call(arguments),
                passContext: false
            };
            if (arguments.length == 1 && this.isOptions(arguments[0])) {
                options = arguments[0];
                if (!(options.pass instanceof Array))
                    options.pass = [];
                options.passContext = !!options.passContext;
            }
            var container = this;
            var wrapper = function () {
                var args = [];
                if (options.passContext)
                    args.push(this);
                args.push.apply(args, options.pass);
                args.push.apply(args, arguments);
                return container.create.apply(container, args);
            };
            wrapper.container = container;
            return wrapper;
        },
        create: function () {
            var instance = this.invokeFactories(this.factories, arguments);
            if (instance !== undefined)
                return instance;
            return this.invokeFactories(this.defaultFactories, arguments);
        },
        invokeFactories: function (factories, args) {
            for (var index = 0, length = factories.length; index < length; ++index) {
                var factory = factories[index];
                var instance = factory.create.apply(factory, args);
                if (instance !== undefined)
                    return instance;
            }
        }
    }, {
        FactoryRequired: undefined
    });

    var Stack = Object.extend({
        string: undefined,
        init: function (options) {
            this.configure(options);
        },
        toString: function () {
            return this.string;
        }
    }, {
        instance: new Container().wrap()
    });
    Stack.instance.container.add({
        factory: Factory.extend({
            create: function () {
                return new Stack();
            }
        }).instance(),
        isDefault: true
    });

    var Error = extend(NativeError, {
        id: undefined,
        name: "Error",
        message: "",
        configure: Object.prototype.configure,
        isOptions: Object.prototype.isOptions,
        init: function (options) {
            this.id = id();
            if (typeof (options) == "string")
                options = {message: options};
            this.configure(options);

            var nativeError = new NativeError();
            NativeObject.defineProperty(this, "nativeError", {
                enumerable: false,
                get: function () {
                    return nativeError;
                }
            });

            var error = this;
            var stack;
            NativeObject.defineProperty(this, "stack", {
                enumerable: true,
                get: function () {
                    if (!stack)
                        stack = Stack.instance(error).toString();
                    return stack;
                }
            });
        }
    }, {
        instance: Object.instance,
        extend: Object.extend
    });

    Stack.instance.container.add({
        factory: Factory.extend({
            create: function (error) {
                var nativeError = error.nativeError;
                var nativeStack = nativeError.stack;
                if (nativeStack === undefined)
                    return;
                var stack = nativeStack;
                var instantiationFrameFinder = /^.*?\s+new\s+/m;
                var instantiationFrameIndex = stack.search(instantiationFrameFinder);
                if (instantiationFrameIndex < 0)
                    return;
                var framesBeforeInstantiation = stack.slice(0, instantiationFrameIndex);

                var frameCountBeforeInstantiation = framesBeforeInstantiation.match(/\n/g).length;
                if (!frameCountBeforeInstantiation)
                    return;
                var unwantedFrameCleanerPattern = "";
                for (var frameIndex = 0; frameIndex < frameCountBeforeInstantiation; ++frameIndex)
                    unwantedFrameCleanerPattern += "\n[^\n]*"
                var unwantedFrameCleaner = new RegExp(unwantedFrameCleanerPattern);

                stack = stack.replace(unwantedFrameCleaner, "");
                stack = stack.replace(/^Error/m, error.name + " " + error.message);
                return new Stack({
                    string: stack
                });
            }
        }).instance()
    });

    var InvalidConfiguration = Error.extend({
        name: "InvalidConfiguration"
    });

    var InvalidArguments = Error.extend({
        name: "InvalidArguments"
    });

    InvalidArguments.Empty = InvalidArguments.extend({
        message: "Arguments required."
    });

    Container.FactoryRequired = InvalidArguments.extend({
        message: "Factory instance required."
    });

    var Publisher = Object.extend({
        id: undefined,
        subscriptions: undefined,
        wrapper: undefined,
        init: function (options) {
            this.id = id();
            this.subscriptions = {};
            this.configure(options);
        },
        addSubscription: function (subscription) {
            if (!(subscription instanceof Subscription))
                throw new Publisher.SubscriptionRequired();
            this.subscriptions[subscription.id] = subscription;
        },
        publish: function (args) {
            if (!(args instanceof Array))
                throw new Publisher.ArrayRequired();
            for (var id in this.subscriptions) {
                var subscription = this.subscriptions[id];
                subscription.notify(args);
            }
        },
        wrap: function () {
            if (this.wrapper)
                return this.wrapper;
            var publisher = this;
            this.wrapper = function () {
                var args = Array.prototype.slice.call(arguments);
                publisher.publish(args);
            };
            this.wrapper.publisher = this;
            return this.wrapper;
        }
    }, {
        instance: new Container().add({
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
        }),
        ArrayRequired: InvalidArguments.extend({
            message: "Array of arguments required."
        }),
        SubscriptionRequired: InvalidArguments.extend({
            message: "Subscription instance required."
        })
    });

    var Subscription = Object.extend({
        id: undefined,
        publisher: undefined,
        subscriber: undefined,
        init: function (options) {
            this.id = id();
            this.configure(options);
            if (!(this.publisher instanceof Publisher))
                throw new Subscription.PublisherRequired();
            if (!(this.subscriber instanceof Subscriber))
                throw new Subscription.SubscriberRequired();
            this.publisher.addSubscription(this);
        },
        notify: function (args) {
            if (!(args instanceof Array))
                throw new Subscription.ArrayRequired();
            this.subscriber.receive(args);
        }
    }, {
        instance: new Container().add({
            factory: Factory.extend({
                create: function (Subscription, options) {
                    if (arguments.length == 1)
                        throw new InvalidArguments.Empty();
                    if (arguments.length > 2)
                        throw new InvalidArguments();
                    if (!Object.prototype.isOptions(options))
                        throw new InvalidArguments();
                    options.publisher = Publisher.instance(options.publisher);
                    options.subscriber = Subscriber.instance(options.subscriber);
                    return new Subscription(options);
                }
            }).instance(),
            isDefault: true
        }).add({
            factory: Factory.extend({
                create: function (Subscription, instance) {
                    if (instance instanceof Subscription)
                        return instance;
                }
            }).instance()
        }).add({
            factory: Factory.extend({
                create: function (Subscription, publisher, subscriber) {
                    if (arguments.length == 3)
                        return Subscription.instance({
                            publisher: publisher,
                            subscriber: subscriber
                        });
                }
            }).instance()
        }).wrap({
            passContext: true
        }),
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

    var Subscriber = Object.extend({
        id: undefined,
        init: function (options) {
            this.id = id();
            this.configure(options);
            if (!(this.callback instanceof Function))
                throw new Subscriber.CallbackRequired();
        },
        receive: function (args) {
            this.callback.apply(null, args);
        },
        subscribe: function (publisher) {
            if (!arguments.length)
                throw new InvalidArguments.Empty();
            if (arguments.length > 1)
                throw new InvalidArguments();
            return Subscription.instance(publisher, this);
        }
    }, {
        instance: new Container().add({
            factory: Factory.extend({
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
            }).instance(),
            isDefault: true
        }).add({
            factory: Factory.extend({
                create: function (Subscriber, instance) {
                    if (instance instanceof Subscriber)
                        return instance;
                }
            }).instance()
        }).wrap({
            passContext: true
        }),
        CallbackRequired: InvalidConfiguration.extend({
            message: "Callback function required."
        })
    });

    return {
        Object: Object,
        Factory: Factory,
        Container: Container,
        Stack: Stack,
        Error: Error,
        InvalidConfiguration: InvalidConfiguration,
        InvalidArguments: InvalidArguments,
        id: id,
        Publisher: Publisher,
        Subscription: Subscription,
        Subscriber: Subscriber,
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

})(Object, Error);