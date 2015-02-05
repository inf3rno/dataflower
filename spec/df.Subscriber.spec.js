var df = require("../df");

describe("df", function () {

    var Subscriber = df.Subscriber;
    var Subscription = df.Subscription;

    describe("Subscriber", function () {

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