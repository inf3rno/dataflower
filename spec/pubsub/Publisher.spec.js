var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Publisher.prototype", function () {

        describe("publish", function () {

            it("requires the array of parameters", function () {

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
                publisher.subscriptions.add(mockSubscription);

                expect(mockSubscription.notify).not.toHaveBeenCalled();

                publisher.publish([1, 2, 3]);
                expect(mockSubscription.notify).toHaveBeenCalledWith([1, 2, 3], undefined);

                var o = {};
                publisher.publish([4, 5, 6], o);
                expect(mockSubscription.notify).toHaveBeenCalledWith([4, 5, 6], o);

            });

        });


        describe("handleWrapper", function () {

            it("calls publish and returns the result", function () {

                var publisher = new Publisher({
                    publish: jasmine.createSpy().and.returnValue(123)
                });
                expect(publisher.handleWrapper([1, 2, 3], {x: 1})).toBe(123);
                expect(publisher.publish).toHaveBeenCalledWith([1, 2, 3], {x: 1});
            });

        });

    });
});