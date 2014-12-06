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
    wrapper: function () {
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
}).wrapper();

var Link = Obj.extend({
    init: function (publisher, subscriber) {
        this.id = uniqueId();
        this.publisher = publisher;
        this.subscriber = subscriber;
    },
    relay: function () {
        this.subscriber.apply(null, arguments);
    },
    connect: function () {
        this.publisher.links[this.id] = this;
        return this;
    },
    disconnect: function () {
        delete(this.publisher.links[this.id]);
        return this;
    }
});

var createLink = function (publisher, subscriber) {
    var link = new Link(publisher, subscriber);
    link.connect();
    return link;
};

var createPublisher = function (component) {
    var links = {};
    var publisher = function () {
        for (var id in links) {
            var link = links[id];
            link.relay.apply(link, arguments);
        }
    };
    publisher.links = links;
    return publisher;
};

var createSubscriber = function (callback, component) {
    var subscriber = function () {
        callback.apply(component, arguments);
    };
    return subscriber;
};

var createComponent = function (config) {
    var component = {};
    for (var key in config) {
        var options = config[key];
        var value;
        if (options === createPublisher)
            value = createPublisher(component);
        else if (options instanceof Function)
            value = createSubscriber(options, component);
        else
            value = options;
        component[key] = value;
    }
    return component;
};

var df = function () {

};

df.Object = Obj;
df.Sequence = Sequence;
df.uniqueId = uniqueId;
df.link = createLink;
df.publisher = createPublisher;
df.subscriber = createSubscriber;
df.component = createComponent;

module.exports = df;