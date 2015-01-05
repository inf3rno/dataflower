module.exports = function (NativeObject) {

    var extend = function (Ancestor, properties) {
        var Descendant = function () {
            if (this.init instanceof Function)
                this.init.apply(this, arguments);
        };
        Descendant.prototype = NativeObject.create(Ancestor.prototype);
        if (properties)
            for (var property in properties)
                Descendant.prototype[property] = properties[property];
        Descendant.prototype.constructor = Descendant;
        Descendant.extend = function (properties) {
            return extend(this, properties);
        };
        return Descendant;
    };

    var Object = extend(NativeObject);

    var Sequence = Object.extend({
        initial: undefined,
        state: undefined,
        generator: undefined,
        init: function (config) {
            this.state = config.initial;
            this.generator = config.generator;
        },
        get: function () {
            return this.state;
        },
        next: function () {
            var args = [this.state];
            args.push.apply(args, arguments);
            this.state = this.generator.apply(this, args);
            return this.get();
        },
        wrap: function () {
            var store = [];
            store.push.apply(store, arguments);
            return function () {
                var args = [];
                args.push.apply(args, store);
                args.push.apply(args, arguments);
                return this.next.apply(this, args);
            }.bind(this);
        }
    });

    var uniqueId = new Sequence({
        generator: function (previousId) {
            return ++previousId;
        },
        initial: 0
    }).wrap();

    return {
        Object: Object,
        Sequence: Sequence,
        uniqueId: uniqueId
    };

}(Object);