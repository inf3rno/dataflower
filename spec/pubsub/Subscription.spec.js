var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Subscription.prototype", function () {

        describe("configure", function () {

            it("requires a publisher and a subscriber", function () {

                var publisher = new Publisher(),
                    subscriber = new Subscriber({
                        callback: function () {
                        }
                    });

                expect(function () {
                    var subscription = new Subscription({
                        subscriber: subscriber
                    });
                }).toThrow(new Subscription.PublisherRequired());


                expect(function () {
                    var subscription = new Subscription({
                        publisher: publisher
                    });
                }).toThrow(new Subscription.SubscriberRequired());

                expect(function () {
                    var subscription = new Subscription({
                        publisher: publisher,
                        subscriber: subscriber
                    });
                }).not.toThrow();
            });

            it("adds the subscription to the components", function () {


                var publisher = new Publisher();
                var subscriber = new Subscriber({
                    callback: function () {
                    }
                });
                publisher.addSubscription = jasmine.createSpy();
                subscriber.addSubscription = jasmine.createSpy();

                expect(publisher.addSubscription).not.toHaveBeenCalled();
                expect(subscriber.addSubscription).not.toHaveBeenCalled();
                var subscription = new Subscription({
                    publisher: publisher,
                    subscriber: subscriber
                });
                expect(publisher.addSubscription).toHaveBeenCalledWith(subscription);
                expect(subscriber.addSubscription).toHaveBeenCalledWith(subscription);
            });

        });

        describe("notify", function () {

            it("requires the array of arguments", function () {

                var publisher = new Publisher(),
                    subscriber = new Subscriber({
                        callback: function () {
                        }
                    }),
                    subscription = new Subscription({
                        publisher: publisher,
                        subscriber: subscriber
                    });

                expect(function () {
                    subscription.notify();
                }).toThrow(new Subscription.ArrayRequired());

            });

            it("notifies the Subscriber in the context of the Publisher", function () {

                var publisher = new Publisher(),
                    subscriber = new Subscriber({
                        callback: function () {
                        }
                    });
                subscriber.receive = jasmine.createSpy();

                var subscription = new Subscription({
                    publisher: publisher,
                    subscriber: subscriber
                });

                expect(subscriber.receive).not.toHaveBeenCalled();
                subscription.notify([1, 2, 3]);
                expect(subscriber.receive).toHaveBeenCalledWith([1, 2, 3], undefined);
            });

            it("notifies the Subscriber in the context if given", function () {

                var publisher = new Publisher(),
                    subscriber = new Subscriber({
                        callback: function () {
                        }
                    });
                subscriber.receive = jasmine.createSpy();

                var o = {};
                var subscription = new Subscription({
                    publisher: publisher,
                    subscriber: subscriber,
                    context: o
                });

                expect(subscriber.receive).not.toHaveBeenCalled();
                subscription.notify([1, 2, 3]);
                expect(subscriber.receive).toHaveBeenCalledWith([1, 2, 3], o);
                subscription.notify([4, 5, 6], {});
                expect(subscriber.receive).toHaveBeenCalledWith([4, 5, 6], o);
            });

        });

    });
});