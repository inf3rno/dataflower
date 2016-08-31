var o3 = require("o3"),
    Class = o3.Class,
    e3 = require("ezone"),
    UserError = e3.UserError,
    EventEmitter = require("events");

var NoDataAvailable = UserError.extend({
    prototype: {
        name: "NoDataAvailable",
        init: function (xyz) {
            UserError.prototype.init.call(this, "No data available on " + xyz.name + ".");
        }
    }
});

var XYZ = Class.extend({
    NoDataAvailable: NoDataAvailable,
    prototype: {
        name: "xyz",
        init: function (options) {
            EventEmitter.call(this);
            this.merge(options);
            this.queue = [];
            this.callbacks = [];
        },
        read: function () {
            if (!this.queue.length)
                throw new NoDataAvailable(this);
            var data = this.queue[0];
            this.queue.shift();
            return data;
        },
        await: function (callback) {
            this.callbacks.push(callback);
            this.tick();
        },
        pull: function (callback) {
            this.await(callback);
            this.emit("pulled", this);
        },
        write: function (data) {
            this.queue.push(data);
            this.tick();
        },
        push: function (data) {
            this.write(data);
            this.emit("pushed", this);
        },
        tick: function () {
            while (this.callbacks.length && this.queue.length) {
                var callback = this.callbacks[0];
                this.callbacks.shift();
                var data = this.queue[0];
                this.queue.shift();
                callback(data);
            }
        }
    }
}).absorb(EventEmitter);

module.exports = XYZ;