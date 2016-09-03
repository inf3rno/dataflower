var o3 = require("o3"),
    Class = o3.Class,
    e3 = require("ezone"),
    UserError = e3.UserError,
    EventEmitter = require("events");

var Flow = Class.extend({
    prototype: {
        blocked: false,
        init: function (options) {
            EventEmitter.call(this);
            this.dataQueue = [];
            this.merge(options);
        },
        isDry: function () {
            return !this.dataQueue.length;
        },
        extract: function () {
            if (this.isDry())
                throw new Flow.DryExtract(this);
            var data = this.dataQueue.shift();
            if (this.isDry())
                this.emit("dry");
            return data;
        },
        drain: function () {
            if (this.isDry())
                return [];
            var data = this.dataQueue.slice();
            this.dataQueue.length = 0;
            this.emit("dry");
            return data;
        },
        sustain: function (data) {
            if (this.isBlocked())
                throw new Flow.BlockedSustain(this);
            this.dataQueue.push.apply(this.dataQueue, arguments);
        },
        block: function () {
            if (this.isBlocked())
                throw new Flow.AlreadyBlocked(this);
            this.blocked = true;
            this.emit("blocked", this);
        },
        isBlocked: function () {
            return this.blocked;
        },
        isSustainable: function () {
            return !this.blocked;
        },
        size: function () {
            return this.dataQueue.length;
        }
    },
    DryExtract: UserError.extend({
        prototype: {
            name: "DryExtract",
            message: "Attempting to extract data from a dry flow."
        }
    }),
    BlockedSustain: UserError.extend({
        prototype: {
            name: "BlockedSustain",
            message: "Attempting to sustain a blocked data flow."
        }
    }),
    AlreadyBlocked: UserError.extend({
        prototype: {
            name: "AlreadyBlocked",
            message: "Attempting to block a data flow but which is already blocked."
        }
    })
}).absorb(EventEmitter);

module.exports = Flow;