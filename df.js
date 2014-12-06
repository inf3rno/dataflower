var extend = function (Ancestor, properties) {
    var Descendant = function () {
        if (this.init instanceof Function)
            this.init.apply(this, arguments);
    };
    Descendant.prototype = Object.create(Ancestor.prototype);
    if (properties)
        for (var property in properties)
            Descendant.prototype[property] = properties[property];
    Descendant.prototype.constructor = Descendant;
    Descendant.extend = function (properties) {
        return extend(this, properties);
    };
    return Descendant;
};

var Obj = extend(Object);
var Sequence = Obj.extend({
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

var Link = Obj.extend({
    id: null,
    publisher: null,
    subscriber: null,
    init: function (publisher, subscriber) {
        this.id = uniqueId();
        this.publisher = publisher;
        this.subscriber = subscriber;
    },
    relay: function () {
        this.subscriber.notify.apply(this.subscriber, arguments);
    },
    connect: function () {
        this.publisher.attach(this);
        return this;
    },
    disconnect: function () {
        this.publisher.detach(this);
        return this;
    }
});

var Publisher = Obj.extend({
    id: null,
    links: null,
    wrapper: null,
    init: function () {
        this.id = uniqueId();
        this.links = {};
    },
    wrap: function () {
        if (this.wrapper)
            return this.wrapper;
        this.wrapper = this.publish.bind(this);
        this.wrapper.component = this;
        return this.wrapper;
    },
    publish: function () {
        for (var id in this.links) {
            var link = this.links[id];
            link.relay.apply(link, arguments);
        }
    },
    attach: function (link) {
        this.links[link.id] = link;
    },
    detach: function (link) {
        delete(this.links[link.id]);
    }
});

var Subscriber = Obj.extend({
    id: null,
    callback: null,
    wrapper: null,
    init: function (callback, context) {
        this.id = uniqueId();
        this.callback = callback;
        this.context = context;
    },
    wrap: function () {
        if (this.wrapper)
            return this.wrapper;
        this.wrapper = this.notify.bind(this);
        this.wrapper.component = this;
        return this.wrapper;
    },
    notify: function () {
        this.callback.apply(this.context, arguments);
    }
});

var Component = Obj.extend({
    init: function (config) {
        for (var key in config) {
            var value = config[key];
            if (value === df.publisher)
                value = df.publisher();
            else if (value instanceof Function)
                value = df.subscriber(value, this);
            this[key] = value;
        }
    }
});

var df = {
    Object: Obj,
    Sequence: Sequence,
    Link: Link,
    Publisher: Publisher,
    Subscriber: Subscriber,
    Component: Component,
    uniqueId: uniqueId,
    link: function (publisher, subscriber) {
        return new Link(publisher.component, subscriber.component).connect();
    },
    publisher: function () {
        return new Publisher().wrap();
    },
    subscriber: function (callback, context) {
        return new Subscriber(callback, context).wrap();
    },
    component: function (config) {
        return new Component(config);
    }
};

module.exports = df;