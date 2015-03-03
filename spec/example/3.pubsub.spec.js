var df = require("dataflower");

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

            var MockEventEmitter = df.Base.extend({
                listeners: undefined,
                init: function () {
                    this.listeners = {};
                },
                on: function (type, listener) {
                    this.listeners[type] = listener;
                },
                trigger: function (type, event) {
                    var listener = this.listeners[type];
                    var parameters = Array.prototype.slice.call(arguments, 1);
                    listener.apply(this, parameters);
                }
            });

            var o1 = new MockEventEmitter(),
                o2 = new MockEventEmitter(),
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
            o1.trigger("myEvent", 1, 2, 3);
            expect(log).toHaveBeenCalledWith(1, 2, 3);

        });

        it("implements Getter", function () {

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
                transfer = getter.toFunction();

            expect(o2.another).toBe("x");
            transfer();
            expect(o2.another).toBe("value");

        });

    });


});