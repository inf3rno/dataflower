var o3 = require("o3"),
    Class = o3.Class,
    e3 = require("ezone"),
    UserError = e3.UserError,
    EventEmitter = require("events");

var DataFlow = Class.extend({
    prototype: {
        name: "aDataFlow",
        exhausted: false,
        init: function (options) {
            EventEmitter.call(this);
            this.merge(options);
            this.dataQueue = [];
            this.callbackQueue = [];
        },
        isDry: function () {
            return !this.dataQueue.length;
        },
        read: function () {
            if (this.isDry())
                throw new DataFlow.DryRead(this);
            return this.dataQueue.shift();
        },
        await: function (callback) {
            if (this.isExhausted() && this.dataQueue.length <= this.callbackQueue.length)
                throw new DataFlow.ExhaustedDryAwait(this);
            this.callbackQueue.push(callback);
            this.tick();
        },
        pull: function (callback) {
            this.await(callback);
            this.emit("pulled", this);
        },
        write: function (data, beforeTick) {
            if (this.isExhausted())
                throw new DataFlow.ExhaustedWrite(this);
            this.dataQueue.push(data);
            if (beforeTick instanceof Function)
                beforeTick(this);
            this.tick();
        },
        push: function (data, beforeTick) {
            this.write(data, beforeTick);
            this.emit("pushed", this);
        },
        exhaust: function () {
            if (this.exhausted)
                throw new Flow.AlreadyExhausted(this);
            this.exhausted = true;
            this.emit("exhausted", this);
            if (this.dataQueue.length < this.callbackQueue.length)
                throw new DataFlow.ExhaustedDryAwait(this);
        },
        isExhausted: function () {
            return this.exhausted;
        },
        tick: function () {
            while (this.callbackQueue.length && this.dataQueue.length) {
                var callback = this.callbackQueue.shift();
                var data = this.dataQueue.shift();
                callback(data);
            }
            if (this.isDry())
                this.emit("dry", this);
        }
    },
    DryRead: UserError.extend({
        prototype: {
            name: "DryRead",
            init: function (flow) {
                UserError.prototype.init.call(this, "Attempting to read " + flow.name + " while it was dry.");
            }
        }
    }),
    ExhaustedWrite: UserError.extend({
        prototype: {
            name: "ExhaustedWrite",
            init: function (flow) {
                UserError.prototype.init.call(this, "Attempting to write " + flow.name + " after it was exhausted.");
            }
        }
    }),
    ExhaustedDryAwait: UserError.extend({
        prototype: {
            name: "ExhaustedDryAwait",
            init: function (flow) {
                UserError.prototype.init.call(this, "Attempting to await " + flow.name + " while it was exhausted and dry.");
            }
        }
    }),
    AlreadyExhausted: UserError.extend({
        prototype: {
            name: "AlreadyExhausted",
            init: function (flow) {
                UserError.prototype.init.call(this, "Attempting to exhaust " + flow.name + " but it was already exhausted.");
            }
        }
    })
}).absorb(EventEmitter);

module.exports = DataFlow;