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
                    publisher: publisher,
                    subscriber: subscriber
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
                    publisher: listener,
                    subscriber: emitter
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
                    publisher: getter,
                    subscriber: setter
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
                    publisher: watcher,
                    subscriber: setter
                });

            expect(o2.another).toBe("x");
            o1.prop = "b";
            expect(o2.another).toBe("b");
        });

    });


});