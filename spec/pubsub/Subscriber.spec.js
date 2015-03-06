var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Subscriber.prototype", function () {

        describe("configure", function () {

            it("requires a callback", function () {

                expect(function () {
                    new Subscriber();
                }).toThrow(new Subscriber.CallbackRequired());

                expect(function () {
                    new Subscriber({
                        callback: function () {
                        }
                    });
                }).not.toThrow();
            });

        });

        describe("receive", function () {

            it("requires the array of parameters", function () {

                var subscriber = new Subscriber({
                    callback: function () {
                    }
                });
                expect(function () {
                    subscriber.receive();
                }).toThrow(new Subscriber.ArrayRequired());
            });

            it("calls the callback with the parameters in the given context", function () {

                var subscriber = new Subscriber({
                    callback: jasmine.createSpy()
                });
                var o = {};

                expect(subscriber.callback).not.toHaveBeenCalled();
                subscriber.receive([1, 2, 3], o);
                expect(subscriber.callback.calls.first().object).toBe(o);
                expect(subscriber.callback).toHaveBeenCalledWith(1, 2, 3);
                subscriber.receive([4, 5, 6]);
                expect(subscriber.callback).toHaveBeenCalledWith(4, 5, 6);
            });

        });

        describe("toFunction", function () {

            it("returns a wrapper", function () {

                var subscriber = new Subscriber({
                    callback: function () {
                    }
                });
                expect(subscriber.toFunction() instanceof Function).toBe(true);
            });

            it("returns always the same wrapper", function () {

                var subscriber = new Subscriber({
                    callback: function () {
                    }
                });
                expect(subscriber.toFunction()).toBe(subscriber.toFunction());
            });

        });

        describe("wrapper", function () {

            it("calls receive with the arguments", function () {

                var subscriber = new Subscriber({
                    callback: function () {
                    }
                });
                subscriber.receive = jasmine.createSpy();

                var wrapper = subscriber.toFunction();
                expect(subscriber.receive).not.toHaveBeenCalled();
                wrapper(1, 2, 3);
                var global = (function () {
                    return this;
                })();
                expect(subscriber.receive).toHaveBeenCalledWith([1, 2, 3], global);
                var o = {
                    m: wrapper
                };
                o.m(4, 5, 6);
                expect(subscriber.receive).toHaveBeenCalledWith([4, 5, 6], o);
            });

            it("has a component property", function () {

                var subscriber = new Subscriber({
                        callback: function () {
                        }
                    }),
                    wrapper = subscriber.toFunction();
                expect(wrapper.component).toBe(subscriber);
            });

        });

    });
});