var EventEmitter = require("events").EventEmitter;

describe("environment", function () {

    describe("Object", function () {

        describe("create", function () {

            it("returns an object in where inherited properties are enumerable", function () {

                var a = {x: {}, y: 1};
                var b = Object.create(a);
                var props = [];
                for (var prop in b)
                    props.push(prop);
                expect(props).toEqual(["x", "y"]);
            });

        });

        describe("defineProperty", function () {

            it("can define a property on an object, which is not enumerable", function () {

                var a = {};
                Object.defineProperty(a, "x", {
                    enumerable: false,
                    value: 1
                });
                var props = [];
                for (var prop in a)
                    props.push(prop);
                expect(props).toEqual([]);
                expect(a.x).toBe(1);

            });

            it("can define a property setter and getter", function () {

                var a = {};
                var current = a.x;
                var log = jasmine.createSpy();
                Object.defineProperty(a, "x", {
                    set: function (value) {
                        log("update", current, value);
                        current = value;
                    },
                    get: function () {
                        log("read", current);
                        return current;
                    }
                });

                expect(log).not.toHaveBeenCalled();
                a.x;
                expect(log).toHaveBeenCalledWith("read", undefined);
                a.x = 1;
                expect(log).toHaveBeenCalledWith("update", undefined, 1);
                expect(a.x).toBe(1);
            });

            it("can turn off delete permanently with configurable", function () {

                var a = {};
                Object.defineProperty(a, "x", {
                    value: 1,
                    configurable: false
                });
                expect(a.x).toBe(1);
                delete(a.x);
                expect(a.x).toBe(1);
                expect(function () {
                    Object.defineProperty(a, "x", {
                        configurable: true
                    });
                }).toThrow();
            });

        });

        describe("getOwnPropertyDescriptor", function () {

            it("returns the descriptor of the property", function () {

                var a = {};
                var descriptor = function (p) {
                    return Object.getOwnPropertyDescriptor(a, p);
                };
                expect(descriptor("x")).not.toBeDefined();
                a.x = 1;
                expect(descriptor("x")).toBeDefined();
                expect(descriptor("x")).toEqual({
                    value: 1,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            });

            it("returns undefined by not own properties", function () {

                var a = {};
                var descriptor = function (p, o) {
                    return Object.getOwnPropertyDescriptor(o || a, p);
                };
                expect(a.toString).toBeDefined();
                expect(a.hasOwnProperty("toString")).toBe(false);
                expect(descriptor("toString")).not.toBeDefined();

                expect(Object.prototype.hasOwnProperty("toString")).toBe(true);
                expect(descriptor("toString", Object.prototype)).toEqual({
                    value: Object.prototype.toString,
                    writable: true,
                    enumerable: false,
                    configurable: true
                });
            });

        });

        describe("prototype", function () {

            it("is NOT an Object instance, which has an object type", function () {

                expect(Object.prototype instanceof Object).toBe(false);
                expect(typeof (Object.prototype)).toBe("object");
                expect(Object.prototype).not.toBe(null);
            });

            describe("hasOwnProperty", function () {

                it("can distinguish inherited and own properties", function () {

                    var a = {x: 1, y: 2};
                    var b = Object.create(a);
                    b.x = 1;
                    expect(a.hasOwnProperty("x")).toBe(true);
                    expect(b.hasOwnProperty("x")).toBe(true);
                    expect(a.hasOwnProperty("y")).toBe(true);
                    expect(b.hasOwnProperty("y")).toBe(false);
                });

            });

        });

    });

    describe("Error", function () {

        it("is an Object relative", function () {

            expect(Error instanceof Object).toBe(true);
        });

        describe("prototype", function () {

            it("is an Object instance", function () {

                expect(Error.prototype instanceof Object).toBe(true);
            });

        });
    });

    describe("null", function () {

        it("is has object type", function () {

            expect(typeof (null)).toBe("object");

        });

        it("is not an Object instance", function () {
            expect(null instanceof Object).toBe(false);
        });

    });

    describe("Array", function () {

        describe("prototype", function () {

            it("cannot be watched with defineProperty", function () {

                var a = [];
                var descriptor = Object.getOwnPropertyDescriptor(a, "length");
                expect(descriptor.configurable).toBe(false);
            });

            it("can be enumerated with a for...in loop", function () {

                var a = [];
                var log = jasmine.createSpy();
                for (var i in a)
                    log(i);
                expect(log).not.toHaveBeenCalled();
                a.push(1, 2, 3);
                for (var i in a)
                    log(i);
                expect(log.calls.count()).toBe(3);
                expect(log).toHaveBeenCalledWith("0");
                expect(log).toHaveBeenCalledWith("1");
                expect(log).toHaveBeenCalledWith("2");
                expect(a["0"]).toBe(1);
            });

            describe("slice", function () {

                it("returns a new sliced array", function () {

                    var a = [0, 1, 2, 3, 4];
                    var r = a.slice(1, -1);
                    expect(r).not.toBe(a);
                    expect(r instanceof Array).toBe(true);
                    expect(r).toEqual([1, 2, 3]);
                });

                it("accepts arguments", function () {

                    var a = [1, 2, 3];
                    var r;
                    var fn = function () {
                        r = Array.prototype.slice.call(arguments);
                    };
                    fn.apply(null, a);
                    expect(r).toEqual(a);
                    expect(r).not.toBe(a);
                });

            });

            describe("shift", function () {

                it("removes the first item of the Array", function () {

                    var a = [0, 1, 2, 3];
                    a.shift();
                    expect(a).toEqual([1, 2, 3]);
                });
            });

            describe("unshift", function () {

                it("adds an item to the beginning of the Array", function () {

                    var a = [2, 3];
                    a.unshift(1);
                    expect(a).toEqual([1, 2, 3]);
                });
            });

        });

    });

    describe("EventEmitter", function () {

        describe("prototype", function () {

            it("is not accessible public whether a listener type was initialized", function () {

                var o = new EventEmitter(),
                    privateStorage = "_events",
                    x = "x",
                    initialized = false;

                expect(EventEmitter.listenerCount(o, x)).toBe(0);
                expect(o.listeners(x)).toEqual([]);
                expect(o[privateStorage].hasOwnProperty(x)).toBe(initialized);

                var l = function () {
                };
                o.on(x, l);
                initialized = true;

                expect(EventEmitter.listenerCount(o, x)).toBe(1);
                expect(o.listeners(x)).toEqual([l]);
                expect(o[privateStorage].hasOwnProperty(x)).toBe(initialized);
            });

            describe("on", function () {

                it("adds listeners to the event", function () {

                    var o = new EventEmitter();
                    var listener = function () {
                    };
                    o.on("x", listener);
                    expect(o.listeners("x")).toEqual([listener]);
                });

            });

            describe("emit", function () {

                it("emits events which are captured by the listeners", function () {

                    var o = new EventEmitter();
                    var listener = jasmine.createSpy();
                    var listener2 = jasmine.createSpy();
                    o.on("x", listener);
                    o.on("x", listener2);
                    o.emit("x", 1, 2, 3);
                    expect(listener).toHaveBeenCalledWith(1, 2, 3);
                    expect(listener2).toHaveBeenCalledWith(1, 2, 3);
                });

            });

            describe("removeListener", function () {

                it("removes the given listener, so it cannot listen the event anymore", function () {

                    var o = new EventEmitter();
                    var listener = jasmine.createSpy();
                    var listener2 = jasmine.createSpy();
                    o.on("x", listener);
                    o.on("x", listener2);
                    o.removeListener("x", listener2);
                    o.emit("x", 1, 2, 3);
                    expect(listener).toHaveBeenCalledWith(1, 2, 3);
                    expect(listener2).not.toHaveBeenCalled();
                });

            });

        });

    });

});