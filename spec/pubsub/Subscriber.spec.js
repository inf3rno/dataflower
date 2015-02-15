var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Subscriber", function () {

        describe("instance", function () {

            it("requires arguments", function () {

                expect(function () {
                    Subscriber.instance();
                }).toThrow(new InvalidArguments.Empty());

            });

            it("accepts configuration options", function () {

                var subscriber = Subscriber.instance({
                    callback: function () {
                    }
                });
                expect(subscriber instanceof Subscriber).toBe(true);
            });

            it("accepts a callback function", function () {

                var callback = function () {
                    },
                    subscriber = Subscriber.instance(callback);
                expect(subscriber instanceof Subscriber);
                expect(subscriber.callback).toBe(callback);

            });

            it("declines too many arguments", function () {

                expect(function () {
                    Subscriber.instance({
                        callback: function () {
                        }
                    }, function () {
                    });
                }).toThrow(new InvalidArguments());

            });

            it("declines invalid arguments", function () {

                expect(function () {
                    Subscriber.instance([function () {
                    }]);
                }).toThrow(new InvalidArguments());

                expect(function () {
                    Subscriber.instance(null);
                }).toThrow(new InvalidArguments());

                expect(function () {
                    Subscriber.instance(1);
                }).toThrow(new InvalidArguments());

            });

            it("accepts Subscriber instance and returns it", function () {

                var subscriber = new Subscriber({
                        callback: function () {
                        }
                    }),
                    subscriber2 = Subscriber.instance(subscriber);
                expect(subscriber2).toBe(subscriber);

            });

            it("returns Descendant instances by inheritation", function () {

                var log = jasmine.createSpy(),
                    Descendant = Subscriber.extend({
                        init: log
                    }),
                    callback = function () {
                    };
                expect(log).not.toHaveBeenCalled();
                var instance = Descendant.instance(callback);
                expect(log).toHaveBeenCalledWith({callback: callback});
                expect(instance instanceof Descendant);
            });

        });

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

            it("accepts Publisher instantiation arguments", function () {

                var o = {
                        x: {}
                    },
                    subscriber = new Subscriber({
                        callback: jasmine.createSpy()
                    }),
                    subscription = subscriber.subscribe(o);
                expect(subscription.publisher instanceof Publisher).toBe(true);
                expect(subscription.publisher.x).toBe(o.x);
            });

        });

    });
});