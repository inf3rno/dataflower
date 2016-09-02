var o3 = require("o3"),
    Class = o3.Class,
    e3 = require("ezone"),
    UserError = e3.UserError,
    EventEmitter = require("events"),
    Flow = require("./Flow");

var Pump = Class.extend({
    prototype: {
        init: function (options) {
            EventEmitter.call(this);
            this.callbackQueue = [];
            if (options instanceof Flow)
                options = {flow: options};
            this.merge(options);
            if (!this.flow)
                this.flow = new Flow();
        },
        await: function (callback) {
            if (!(callback instanceof Function))
                throw new Pump.InvalidCallback();
            this.callbackQueue.push(callback);
            this.refresh();
        },
        pull: function (callback) {
            if (callback instanceof Function)
                this.callbackQueue.push(callback);
            this.emit("pulled", this.flow, this);
            this.refresh();
        },
        push: function (callback) {
            if (callback instanceof Function)
                callback(this.flow, this);
            this.emit("pushed", this.flow, this);
            this.refresh();
        },
        transaction: function (callback) {
            if (!(callback instanceof Function))
                throw new Pump.InvalidCallback();
            (function () {
                callback(this.flow, this);
                this.refresh();
            }).call(this);
        },
        refresh: function () {
            while (this.callbackQueue.length && !this.flow.isDry()) {
                var callback = this.callbackQueue.shift();
                callback(this.flow, this);
            }
            this.emit("refreshed", this.flow, this);
            if (this.callbackQueue.length && this.flow.isDry() && this.flow.isBlocked())
                throw new Pump.BlockedDryAwait();
        }
    },
    InvalidCallback: UserError.extend({
        prototype: {
            name: "InvalidCallback",
            message: "The passed callback is not a Function."
        }
    }),
    BlockedDryAwait: UserError.extend({
        prototype: {
            name: "BlockedDryAwait",
            message: "Attempting to await or pull a data pump while its data flow was dry and blocked."
        }
    })
}).absorb(EventEmitter);

module.exports = Pump;