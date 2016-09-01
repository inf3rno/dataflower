var o3 = require("o3"),
    Class = o3.Class,
    e3 = require("ezone"),
    UserError = e3.UserError,
    EventEmitter = require("events");

var NoDataAvailable = UserError.extend({
    prototype: {
        name: "NoDataAvailable",
        init: function (flow) {
            UserError.prototype.init.call(this, "No data available on " + flow.name + ".");
        }
    }
});

var DataFlow = Class.extend({
    NoDataAvailable: NoDataAvailable,
    prototype: {
        name: "aDataFlow",
        init: function (options) {
            EventEmitter.call(this);
            this.merge(options);
            this.dataQueue = [];
            this.callbackQueue = [];
        },
        read: function () {
            if (!this.dataQueue.length)
                throw new NoDataAvailable(this);
            return this.dataQueue.shift();
        },
        await: function (callback) {
            this.callbackQueue.push(callback);
            this.tick();
        },
        pull: function (callback) {
            this.await(callback);
            this.emit("pulled", this);
        },
        write: function (data) {
            this.dataQueue.push(data);
            this.tick();
        },
        push: function (data) {
            this.write(data);
            this.emit("pushed", this);
        },
        tick: function () {
            while (this.callbackQueue.length && this.dataQueue.length) {
                var callback = this.callbackQueue.shift();
                var data = this.dataQueue.shift();
                callback(data);
            }
        }
    }
}).absorb(EventEmitter);

module.exports = DataFlow;