var df = require("dataflower"),
    EventEmitter = require("events").EventEmitter;

describe("example", function () {

    describe("3. pub/sub pattern", function () {

        it("implements Publisher, Subscriber, Subscription", function () {

            var publisher = new df.Publisher(),
                log = jasmine.createSpy(),
                subscriber = new df.Subscriber({
                    callback: log
                }),
                subscription = new df.Subscription({
                    flows: [
                        publisher,
                        subscriber
                    ]
                });
            expect(log).not.toHaveBeenCalled();
            publisher.publish([1, 2, 3]);
            expect(log).toHaveBeenCalledWith(1, 2, 3);
            publisher.publish([4, 5, 6]);
            expect(log).toHaveBeenCalledWith(4, 5, 6);
            subscriber.receive([7, 8, 9]);
            expect(log).toHaveBeenCalledWith(7, 8, 9);
        });

        it("implements Emitter, Listener", function () {

            var o1 = new EventEmitter(),
                o2 = new EventEmitter(),
                listener = new df.Listener({
                    subject: o1,
                    event: "myEvent"
                }),
                emitter = new df.Emitter({
                    subject: o2,
                    event: "anotherEvent"
                }),
                subscription = new df.Subscription({
                    flows: [
                        listener,
                        emitter
                    ]
                }),
                log = jasmine.createSpy();
            o2.on("anotherEvent", log);
            expect(log).not.toHaveBeenCalled();
            o1.emit("myEvent", 1, 2, 3);
            expect(log).toHaveBeenCalledWith(1, 2, 3);
        });

        it("implements Getter, Setter", function () {

            var o1 = {
                    prop: "value"
                },
                o2 = {
                    another: "x"
                },
                getter = new df.Getter({
                    subject: o1,
                    property: "prop"
                }),
                setter = new df.Setter({
                    subject: o2,
                    property: "another"
                }),
                subscription = new df.Subscription({
                    flows: [
                        getter,
                        setter
                    ]
                }),
                sync = getter.toFunction();

            expect(o2.another).toBe("x");
            sync();
            expect(o2.another).toBe("value");
        });

        it("implements Watcher", function () {

            var o1 = {
                    prop: "a"
                },
                o2 = {
                    another: "x"
                },
                watcher = new df.Watcher({
                    subject: o1,
                    property: "prop"
                }),
                setter = new df.Setter({
                    subject: o2,
                    property: "another"
                }),
                subscription = new df.Subscription({
                    flows: [
                        watcher,
                        setter
                    ]
                });

            expect(o2.another).toBe("x");
            o1.prop = "b";
            expect(o2.another).toBe("b");
        });

        it("implements Task", function () {

            jasmine.clock().install();

            var task = new df.Task({
                callback: function (done, i, j) {
                    setTimeout(function () {
                        if (i && j)
                            done(null, i, j);
                        else
                            done("error", i, j);
                    }, 0);
                }
            });

            var called = jasmine.createSpy();
            var done = jasmine.createSpy();
            var error = jasmine.createSpy();

            new df.Subscription({
                flows: [
                    task.called,
                    new df.Subscriber({
                        callback: called
                    })
                ]
            });
            new df.Subscription({
                flows: [
                    task.done,
                    new df.Subscriber({
                        callback: done
                    })
                ]
            });
            new df.Subscription({
                flows: [
                    task.error,
                    new df.Subscriber({
                        callback: error
                    })
                ]
            });

            var o = {
                x: task.toFunction()
            };

            expect(called).not.toHaveBeenCalled();
            expect(done).not.toHaveBeenCalled();
            expect(error).not.toHaveBeenCalled();

            o.x(1, 2);
            jasmine.clock().tick(1);
            expect(called).toHaveBeenCalledWith(1, 2);
            expect(done).toHaveBeenCalledWith(1, 2);
            expect(error).not.toHaveBeenCalled();
            done.calls.reset();

            o.x(0, 1);
            jasmine.clock().tick(1);
            expect(called).toHaveBeenCalledWith(0, 1);
            expect(done).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith("error", 0, 1);

            jasmine.clock().uninstall();
        });

        it("implements Spy", function () {

            var err = new Error();
            var spy = new df.Spy({
                callback: function (i, j) {
                    if (i && j)
                        return i + j;
                    throw err;
                }
            });

            var called = jasmine.createSpy();
            var done = jasmine.createSpy();
            var error = jasmine.createSpy();

            new df.Subscription({
                flows: [
                    spy.called,
                    new df.Subscriber({
                        callback: called
                    })
                ]
            });
            new df.Subscription({
                flows: [
                    spy.done,
                    new df.Subscriber({
                        callback: done
                    })
                ]
            });
            new df.Subscription({
                flows: [
                    spy.error,
                    new df.Subscriber({
                        callback: error
                    })
                ]
            });

            var o = {
                x: spy.toFunction()
            };

            expect(called).not.toHaveBeenCalled();
            expect(done).not.toHaveBeenCalled();
            expect(error).not.toHaveBeenCalled();

            o.x(1, 2);
            expect(called).toHaveBeenCalledWith(1, 2);
            expect(done).toHaveBeenCalledWith(3);
            expect(error).not.toHaveBeenCalled();
            done.calls.reset();

            expect(function () {
                o.x(0, 1);
            }).toThrow(err);

            expect(called).toHaveBeenCalledWith(0, 1);
            expect(done).not.toHaveBeenCalled();
            expect(error).toHaveBeenCalledWith(err);
        });

    });


});