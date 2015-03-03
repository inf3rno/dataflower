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

        it("implements Listener", function () {

            var o = {
                    listeners: {},
                    on: function (type, listener) {
                        this.listeners[type] = listener;
                    },
                    trigger: function (type, event) {
                        var listener = this.listeners[type];
                        var parameters = Array.prototype.slice.call(arguments, 1);
                        listener.apply(this, parameters);
                    }
                },
                listener = new df.Listener({
                    subject: o,
                    event: "myEvent"
                }),
                log = jasmine.createSpy(),
                subscriber = new df.Subscriber({
                    callback: log
                }),
                subscription = new df.Subscription({
                    publisher: listener,
                    subscriber: subscriber
                });
            expect(log).not.toHaveBeenCalled();
            o.trigger("myEvent", 1, 2, 3);
            expect(log).toHaveBeenCalledWith(1, 2, 3);

        });

    });


});