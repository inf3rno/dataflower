var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Publisher.prototype", function () {

        describe("init", function () {

            it("generates an id", function () {
                expect(new Publisher().id).not.toBe(new Publisher().id);
            });

            it("accepts configuration options", function () {

                var o = {
                        x: {}
                    },
                    publisher = new Publisher(o);
                expect(publisher.x).toBe(o.x);
            });

        });

        describe("addSubscription", function () {

            it("requires a subscription", function () {

                var publisher = new Publisher();
                expect(function () {
                    publisher.addSubscription();
                }).toThrow(new Publisher.SubscriptionRequired());

            });

            it("adds a subscription", function () {

                var mockSubscription = Object.create(Subscription.prototype);
                mockSubscription.id = 1;

                var publisher = new Publisher();
                publisher.addSubscription(mockSubscription);

                expect(publisher.subscriptions[1]).toBe(mockSubscription);

            });

        });

        describe("publish", function () {

            it("requires the array of arguments", function () {

                var publisher = new Publisher();
                expect(function () {
                    publisher.publish();
                }).toThrow(new Publisher.ArrayRequired());

            });

            it("sends messages to the added subscriptions", function () {

                var mockSubscription = Object.create(Subscription.prototype);
                mockSubscription.id = 1;
                mockSubscription.notify = jasmine.createSpy();

                var publisher = new Publisher();
                publisher.addSubscription(mockSubscription);

                expect(mockSubscription.notify).not.toHaveBeenCalled();

                publisher.publish([1, 2, 3]);
                expect(mockSubscription.notify).toHaveBeenCalledWith([1, 2, 3]);

                publisher.publish([4, 5, 6]);
                expect(mockSubscription.notify).toHaveBeenCalledWith([4, 5, 6]);

            });

        });

        describe("wrap", function () {

            it("returns a wrapper", function () {

                var publisher = new Publisher();
                expect(publisher.wrap() instanceof Function).toBe(true);

            });

            it("returns always the same wrapper", function () {

                var publisher = new Publisher();
                expect(publisher.wrap()).toBe(publisher.wrap());

            });

        });

        describe("wrapper", function () {

            it("calls publish with the arguments", function () {

                var publisher = new Publisher();
                publisher.publish = jasmine.createSpy();

                var wrapper = publisher.wrap();
                expect(publisher.publish).not.toHaveBeenCalled();
                wrapper(1, 2, 3);
                expect(publisher.publish).toHaveBeenCalledWith([1, 2, 3]);
            });

            it("has a component property", function () {

                var publisher = new Publisher(),
                    wrapper = publisher.wrap();
                expect(wrapper.component).toBe(publisher);
            });

        });


    });
});