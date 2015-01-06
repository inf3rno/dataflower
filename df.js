module.exports = function (NativeObject) {

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
            if (!options.init || arguments.length == 1)
                return;
            var args;
            if (arguments.length == 2 && (arguments[1] instanceof Array) || (typeof(arguments[1]) == typeof (arguments) && !isNaN(arguments[1].length)))
                args = arguments[1];
            else
                args = Array.prototype.slice.call(arguments, 1);
            this.init.apply(this, args);
        }
    }, {
        instance: function () {
            var instance = NativeObject.create(this.prototype);
            this.apply(instance, arguments);
            return instance;
        },
        extend: function (properties, staticProperties) {
            return extend(this, properties, staticProperties);
        }
    });

    var Sequence = Object.extend({
        state: undefined,
        generator: undefined,
        init: function (options) {
            this.configure(options, arguments);
        },
        next: function () {
            var args = [this.state];
            args.push.apply(args, arguments);
            this.state = this.generator.apply(this, args);
            return this.state;
        },
        wrap: function () {
            var store = [];
            store.push.apply(store, arguments);
            var wrapper = function () {
                var args = [];
                args.push.apply(args, store);
                args.push.apply(args, arguments);
                return this.next.apply(this, args);
            }.bind(this);
            wrapper.sequence = this;
            return wrapper;
        }
    });

    var uniqueId = new Sequence({
        generator: function (previousId) {
            return ++previousId;
        },
        state: 0
    }).wrap();

    return {
        Object: Object,
        Sequence: Sequence,
        uniqueId: uniqueId
    };

}(Object);