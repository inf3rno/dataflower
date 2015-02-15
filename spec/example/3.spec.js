var df = require("dataflower");

describe("example", function () {

    describe("3. pub/sub pattern", function () {

        it("implements Publisher, Subscriber, Subscription", function () {
            var publisher = new df.Publisher(),
                log = jasmine.createSpy();
            new df.Subscription({
                publisher: publisher,
                subscriber: new df.Subscriber({
                    callback: log
                })
            });
            expect(log).not.toHaveBeenCalled();
            publisher.publish([1, 2, 3]);
            expect(log).toHaveBeenCalledWith(1, 2, 3);
            publisher.publish([4, 5, 6]);
            expect(log).toHaveBeenCalledWith(4, 5, 6);
        });

        it("implements static factory methods and wrapper functions", function () {
            var o = {
                send: df.Publisher.instance().wrap(),
                receive: jasmine.createSpy()
            };
            df.Subscription.instance(
                o.send.component,
                df.Subscriber.instance(o.receive)
            );
            expect(o.receive).not.toHaveBeenCalled();
            o.send(1, 2, 3);
            expect(o.receive).toHaveBeenCalledWith(1, 2, 3);
            o.send(4, 5, 6);
            expect(o.receive).toHaveBeenCalledWith(4, 5, 6);
        });

        it("implements factory functions", function () {
            var o = {
                send: df.publisher(),
                receive: jasmine.createSpy()
            };
            df.subscribe(o.send, o.receive);
            expect(o.receive).not.toHaveBeenCalled();
            o.send(1, 2, 3);
            expect(o.receive).toHaveBeenCalledWith(1, 2, 3);
            o.send(4, 5, 6);
            expect(o.receive).toHaveBeenCalledWith(4, 5, 6);
        });

        it("implements Subscriber.subscribe", function () {
            var o = {
                send: df.publisher(),
                receive: jasmine.createSpy()
            };
            df.subscriber(o.receive).subscribe(o.send);
            expect(o.receive).not.toHaveBeenCalled();
            o.send(1, 2, 3);
            expect(o.receive).toHaveBeenCalledWith(1, 2, 3);
            o.send(4, 5, 6);
            expect(o.receive).toHaveBeenCalledWith(4, 5, 6);
        });

    });


});