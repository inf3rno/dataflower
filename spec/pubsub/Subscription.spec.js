var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Subscription.prototype", function () {

        describe("init", function () {

            it("requires a publisher and a subscriber", function () {

                var publisher = new Publisher(),
                    mockSubscriber = Object.create(Subscriber.prototype);

                expect(function () {
                    var subscription = new Subscription({
                        subscriber: mockSubscriber
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
                        subscriber: mockSubscriber
                    });
                }).not.toThrow();
            });

            it("adds the subscription to the publisher", function () {

                var mockPublisher = Object.create(Publisher.prototype);
                mockPublisher.addSubscription = jasmine.createSpy();
                var mockSubscriber = Object.create(Subscriber.prototype);

                expect(mockPublisher.addSubscription).not.toHaveBeenCalled();
                var subscription = new Subscription({
                    publisher: mockPublisher,
                    subscriber: mockSubscriber
                });
                expect(mockPublisher.addSubscription).toHaveBeenCalledWith(subscription);
            });

        });

        describe("notify", function () {

            it("requires the array of arguments", function () {

                var publisher = new Publisher(),
                    mockSubscriber = Object.create(Subscriber.prototype),
                    subscription = new Subscription({
                        publisher: publisher,
                        subscriber: mockSubscriber
                    });

                expect(function () {
                    subscription.notify();
                }).toThrow(new Subscription.ArrayRequired());

            });

            it("notifies the Subscriber in the context of the Publisher", function () {

                var publisher = new Publisher(),
                    mockSubscriber = Object.create(Subscriber.prototype);
                mockSubscriber.receive = jasmine.createSpy();

                var subscription = new Subscription({
                    publisher: publisher,
                    subscriber: mockSubscriber
                });

                expect(mockSubscriber.receive).not.toHaveBeenCalled();
                subscription.notify([1, 2, 3]);
                expect(mockSubscriber.receive).toHaveBeenCalledWith([1, 2, 3], undefined);
            });

            it("notifies the Subscriber in the context if given", function () {

                var publisher = new Publisher(),
                    mockSubscriber = Object.create(Subscriber.prototype);
                mockSubscriber.receive = jasmine.createSpy();

                var o = {};
                var subscription = new Subscription({
                    publisher: publisher,
                    subscriber: mockSubscriber,
                    context: o
                });

                expect(mockSubscriber.receive).not.toHaveBeenCalled();
                subscription.notify([1, 2, 3]);
                expect(mockSubscriber.receive).toHaveBeenCalledWith([1, 2, 3], o);
                subscription.notify([4, 5, 6], {});
                expect(mockSubscriber.receive).toHaveBeenCalledWith([4, 5, 6], o);
            });

        });

    });
});