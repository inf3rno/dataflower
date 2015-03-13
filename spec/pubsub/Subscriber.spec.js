var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription,
    dummy = df.dummy;

describe("pubsub", function () {

    describe("Subscriber.prototype", function () {

        describe("configure", function () {

            it("requires a callback", function () {

                expect(function () {
                    new Subscriber();
                }).toThrow(new Subscriber.CallbackRequired());

                expect(function () {
                    new Subscriber({
                        callback: dummy
                    });
                }).not.toThrow();
            });

        });

        describe("receive", function () {

            it("calls activate and returns the result", function () {

                var subscriber = new Subscriber({
                    callback: dummy,
                    activate: jasmine.createSpy().and.returnValue(123)
                });
                expect(subscriber.receive([1, 2, 3], {x: 1})).toBe(123);
                expect(subscriber.activate).toHaveBeenCalledWith([1, 2, 3], {x: 1});
            });

        });

        describe("activate", function () {

            it("requires the array of parameters", function () {

                var subscriber = new Subscriber({
                    callback: dummy
                });
                expect(function () {
                    subscriber.activate();
                }).toThrow(new Subscriber.ArrayRequired());
            });

            it("calls the callback with the parameters in the given context", function () {

                var subscriber = new Subscriber({
                    callback: jasmine.createSpy()
                });
                var o = {};

                expect(subscriber.callback).not.toHaveBeenCalled();
                subscriber.activate([1, 2, 3], o);
                expect(subscriber.callback.calls.first().object).toBe(o);
                expect(subscriber.callback).toHaveBeenCalledWith(1, 2, 3);
                subscriber.activate([4, 5, 6]);
                expect(subscriber.callback).toHaveBeenCalledWith(4, 5, 6);
            });

        });

    });
});