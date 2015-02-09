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
            if (!options)
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

    var StackFactory = Object.extend({
        cache: undefined,
        init: function () {
            this.cache = {};
        },
        getStack: function (customError, nativeError) {
            if (!this.cache.hasOwnProperty(customError.id)) {
                var stack;
                if (nativeError.stack)
                    stack = this.createV8Stack(customError, nativeError);
                this.cache[customError.id] = stack;
            }
            return this.cache[customError.id];
        },
        createV8Stack: function (customError, nativeError) {
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
            stack = stack.replace(/^Error/m, customError.name + " " + customError.message);
            return stack;
        }
    });

    var Error = extend(NativeError, {
        id: undefined,
        name: "Error",
        message: "",
        configure: Object.prototype.configure,
        init: function (options) {
            this.id = id();
            if (typeof (options) == "string")
                options = {message: options};
            this.configure(options);

            var nativeError = new NativeError();
            var customError = this;
            NativeObject.defineProperty(this, "stack", {
                enumerable: true,
                configurable: false,
                get: function () {
                    return Error.stackFactory.getStack(customError, nativeError);
                }
            });
        }
    }, {
        instance: Object.instance,
        extend: Object.extend,
        stackFactory: new StackFactory()
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
        instance: function () {
            var Publisher = this;
            if (!arguments.length)
                return new Publisher();
            if (arguments.length > 1)
                throw new InvalidArguments();
            var options = arguments[0];
            if (options instanceof Publisher)
                return options;
            if ((options instanceof Function) && (options.publisher instanceof Publisher))
                return options.publisher;
            if (!options || options.constructor !== NativeObject)
                throw new InvalidArguments();
            return new Publisher(options);
        },
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
        instance: function () {
            var Subscription = this;
            if (!arguments.length)
                throw new InvalidArguments.Empty();
            if (arguments.length > 2)
                throw new InvalidArguments();
            var options;
            if (arguments.length == 1)
                options = arguments[0];
            else {
                options = {
                    publisher: arguments[0],
                    subscriber: arguments[1]
                }
            }
            if (options instanceof Subscription)
                return options;
            if (!options || options.constructor !== NativeObject)
                throw new InvalidArguments();
            options.publisher = Publisher.instance(options.publisher);
            options.subscriber = Subscriber.instance(options.subscriber);
            return new Subscription(options);
        },
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
        instance: function () {
            var Subscriber = this;
            if (!arguments.length)
                throw new InvalidArguments.Empty();
            if (arguments.length > 1)
                throw new InvalidArguments();
            var options = arguments[0];
            if (options instanceof Subscriber)
                return options;
            if (options instanceof Function)
                options = {
                    callback: options
                };
            if (!options || options.constructor !== NativeObject)
                throw new InvalidArguments();
            return new Subscriber(options);
        },
        CallbackRequired: InvalidConfiguration.extend({
            message: "Callback function required."
        })
    });

    return {
        Object: Object,
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