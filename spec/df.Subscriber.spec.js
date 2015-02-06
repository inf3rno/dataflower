var df = require("../df");

describe("df", function () {

    var Subscriber = df.Subscriber;
    var InvalidArguments = df.InvalidArguments;

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
                };
                var subscriber = Subscriber.instance(callback);
                expect(subscriber instanceof Subscriber);
                expect(subscriber.callback).toBe(callback);

            });

            it("refuses too many arguments", function () {

                expect(function () {
                    Subscriber.instance({
                        callback: function () {
                        }
                    }, function () {
                    });
                }).toThrow(new InvalidArguments());

            });

            it("refuses invalid arguments", function () {

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

            it("accept Subscriber instance and returns it", function () {

                var subscriber = new Subscriber({
                    callback: function () {
                    }
                });
                var subscriber2 = Subscriber.instance(subscriber);
                expect(subscriber).toBe(subscriber2);

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

                expect(new Subscriber({
                    callback: function () {
                    }
                }).id).not.toEqual(Subscriber.prototype.id);
            });

        });

        describe("receive", function () {

            it("calls the callback with the args", function () {

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

    });
});