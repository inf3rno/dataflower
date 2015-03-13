var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Publisher.prototype", function () {

        describe("publish", function () {

            it("calls activate and returns the result", function () {

                var publisher = new Publisher({
                    activate: jasmine.createSpy().and.returnValue(123)
                });
                expect(publisher.publish([1, 2, 3], {x: 1})).toBe(123);
                expect(publisher.activate).toHaveBeenCalledWith([1, 2, 3], {x: 1});
            });

        });

        describe("activate", function () {

            it("requires the array of parameters", function () {

                var publisher = new Publisher();
                expect(function () {
                    publisher.activate();
                }).toThrow(new Publisher.ArrayRequired());

            });

            it("sends messages to the added subscriptions", function () {

                var mockSubscription = Object.create(Subscription.prototype);
                mockSubscription.id = 1;
                mockSubscription.activate = jasmine.createSpy();

                var publisher = new Publisher();
                publisher.subscriptions.add(mockSubscription);

                expect(mockSubscription.activate).not.toHaveBeenCalled();

                publisher.activate([1, 2, 3]);
                expect(mockSubscription.activate).toHaveBeenCalledWith([1, 2, 3], undefined);

                var o = {};
                publisher.activate([4, 5, 6], o);
                expect(mockSubscription.activate).toHaveBeenCalledWith([4, 5, 6], o);

            });

        });

    });
});