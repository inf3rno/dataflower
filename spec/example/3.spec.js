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

        it("implements factory functions", function () {
            var log = jasmine.createSpy();
            var o = {
                send: df.publisher(),
                receive: df.subscriber(log)
            };
            df.subscribe(o.send, o.receive);
            expect(log).not.toHaveBeenCalled();
            o.send(1, 2, 3);
            expect(log).toHaveBeenCalledWith(1, 2, 3);
            o.send(4, 5, 6);
            expect(log).toHaveBeenCalledWith(4, 5, 6);
            o.receive(7, 8, 9);
            expect(log).toHaveBeenCalledWith(7, 8, 9);
        });

    });


});