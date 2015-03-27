var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription,
    dummy = df.dummy;

describe("pubsub", function () {

    describe("Subscription.prototype", function () {

        describe("notify", function () {

            it("calls activate and returns the result", function () {

                var subscription = new Subscription({
                    activate: jasmine.createSpy().and.returnValue(123)
                });
                expect(subscription.notify([1, 2, 3], {x: 1})).toBe(123);
                expect(subscription.activate).toHaveBeenCalledWith([1, 2, 3], {x: 1});
            });

        });


        describe("activate", function () {

            it("requires the array of arguments", function () {

                var subscription = new Subscription();
                expect(function () {
                    subscription.activate();
                }).toThrow(new Subscription.ArrayRequired());
            });

            it("activates the Subscribers in the passed context", function () {

                var publisher = new Publisher();
                publisher.activate = jasmine.createSpy();
                var subscriber = new Subscriber({
                    callback: dummy
                });
                subscriber.activate = jasmine.createSpy();

                var subscription = new Subscription({
                    flows: [publisher, subscriber]
                });

                expect(subscriber.activate).not.toHaveBeenCalled();
                subscription.activate([1, 2, 3]);
                expect(subscriber.activate).toHaveBeenCalledWith([1, 2, 3], undefined);
                subscription.activate([4, 5, 6], {a: 1});
                expect(subscriber.activate).toHaveBeenCalledWith([4, 5, 6], {a: 1});
                expect(publisher.activate).not.toHaveBeenCalled();
            });

            it("notifies the Subscribers in the merged context if it is defined (even if another context is passed)", function () {

                var subscriber = new Subscriber({
                    callback: dummy
                });
                subscriber.activate = jasmine.createSpy();

                var o = {a: 1};
                var subscription = new Subscription({
                    flows: [subscriber],
                    context: o
                });

                expect(subscriber.activate).not.toHaveBeenCalled();
                subscription.activate([1, 2, 3]);
                expect(subscriber.activate).toHaveBeenCalledWith([1, 2, 3], o);
                subscription.activate([4, 5, 6], {x: 1});
                expect(subscriber.activate).toHaveBeenCalledWith([4, 5, 6], o);
            });

        });

    });
});