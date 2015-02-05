var df = require("../df");

describe("df", function () {

    var Publisher = df.Publisher;
    var Subscriber = df.Subscriber;
    var Subscription = df.Subscription;

    describe("Subscription", function () {

        describe("init", function () {

            it("requires a publisher and a subscriber", function () {

                var publisher = new Publisher();
                var mockSubscriber = Object.create(Subscriber.prototype);

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

            it("generates an id", function () {

                var publisher = new Publisher();
                var mockSubscriber = Object.create(Subscriber.prototype);

                expect(new Subscription({
                    publisher: publisher,
                    subscriber: mockSubscriber
                }).id).not.toEqual(Subscription.prototype.id);
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

                var publisher = new Publisher();
                var mockSubscriber = Object.create(Subscriber.prototype);
                var subscription = new Subscription({
                    publisher: publisher,
                    subscriber: mockSubscriber
                });

                expect(function () {
                    subscription.notify();
                }).toThrow(new Subscription.ArrayRequired());

            });

            it("notifies the subscriber", function () {

                var publisher = new Publisher();
                var mockSubscriber = Object.create(Subscriber.prototype);
                mockSubscriber.receive = jasmine.createSpy();

                var subscription = new Subscription({
                    publisher: publisher,
                    subscriber: mockSubscriber
                });

                expect(mockSubscriber.receive).not.toHaveBeenCalled();
                subscription.notify([1, 2, 3]);
                expect(mockSubscriber.receive).toHaveBeenCalledWith([1, 2, 3]);
            });

        });

    });
});