var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Subscriber.prototype", function () {

        describe("init", function () {

            it("requires a callback", function () {

                expect(function () {
                    var subscriber = new Subscriber();
                }).toThrow(new Subscriber.CallbackRequired());

                expect(function () {
                    var subscriber = new Subscriber({
                        callback: function () {
                        }
                    });
                }).not.toThrow();
            });

            it("generates an id", function () {

                var options = {
                    callback: function () {
                    }
                };
                expect(new Subscriber(options).id).not.toBe(new Subscriber(options).id);
            });

        });

        describe("receive", function () {

            it("calls the callback with the parameters", function () {

                var subscriber = new Subscriber({
                    callback: jasmine.createSpy()
                });

                expect(subscriber.callback).not.toHaveBeenCalled();
                subscriber.receive([1, 2, 3]);
                expect(subscriber.callback).toHaveBeenCalledWith(1, 2, 3);
                subscriber.receive([4, 5, 6]);
                expect(subscriber.callback).toHaveBeenCalledWith(4, 5, 6);

            });

        });

        describe("subscribe", function () {

            it("subscribes to the given publisher", function () {

                var subscriber = new Subscriber({
                        callback: jasmine.createSpy()
                    }),
                    publisher = new Publisher(),
                    subscription = subscriber.subscribe(publisher);

                expect(subscription instanceof Subscription);

                expect(subscriber.callback).not.toHaveBeenCalled();
                publisher.publish([1, 2, 3]);
                expect(subscriber.callback).toHaveBeenCalledWith(1, 2, 3);
            });

            it("declines zero and multiple arguments", function () {

                var subscriber = new Subscriber({
                    callback: function () {
                    }
                });

                expect(function () {
                    subscriber.subscribe();
                }).toThrow(new InvalidArguments.Empty());

                expect(function () {
                    subscriber.subscribe(new Publisher(), new Publisher());
                }).toThrow(new InvalidArguments());

            });

        });

    });
});