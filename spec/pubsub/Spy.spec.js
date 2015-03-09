var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Subscriber = ps.Subscriber,
    Spy = ps.Spy,
    Publisher = ps.Publisher,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Spy", function () {

        it("is a Subscriber descendant", function () {

            expect(Spy.prototype instanceof Subscriber).toBe(true);
        });

        describe("configure", function () {

            it("creates an error and a done Publisher", function () {

                var spy = new Spy({
                    callback: function () {
                    }
                });
                expect(spy.called instanceof Publisher).toBe(true);
                expect(spy.done instanceof Publisher).toBe(true);
                expect(spy.error instanceof Publisher).toBe(true);
            });

        });

        describe("receive", function () {

            it("requires the array of parameters", function () {

                var spy = new Spy({
                    callback: function () {
                    }
                });
                expect(function () {
                    spy.receive();
                }).toThrow(new Spy.ArrayRequired());
            });

            it("publishes the parameters on the called Publisher", function () {

                var log = jasmine.createSpy();
                var spy = new Spy({
                    callback: log
                });
                new Subscription({
                    items: [
                        spy.called,
                        new Subscriber({
                            callback: log
                        })
                    ]
                });
                var o = {
                    m: spy.toFunction()
                };
                o.m(1, 2, 3);
                expect(log).toHaveBeenCalledWith(1, 2, 3);
                expect(log.calls.count()).toBe(2);
                expect(log.calls.first()).toEqual(log.calls.mostRecent());
            });

            it("returns the result of the call", function () {

                var spy = new Spy({
                    callback: function () {
                        return 123;
                    }
                });
                expect(spy.receive([], {})).toBe(123);
            });

            it("publishes the result of the call on the done Publisher", function () {

                var spy = new Spy({
                    callback: function () {
                        return 123;
                    }
                });
                var log = jasmine.createSpy();
                new Subscription({
                    items: [
                        spy.done,
                        new Subscriber({
                            callback: log
                        })
                    ]
                });

                expect(log).not.toHaveBeenCalled();

                var o = {};
                spy.receive([], o);

                expect(log).toHaveBeenCalledWith(123);
                expect(log.calls.first().object).toBe(o);
            });

            it("publishes the raised errors on the error Publisher", function () {

                var err = new Error();
                var spy = new Spy({
                    callback: function () {
                        throw err;
                    }
                });
                var log = jasmine.createSpy();
                new Subscription({
                    items: [
                        spy.error,
                        new Subscriber({
                            callback: log
                        })
                    ]
                });

                expect(log).not.toHaveBeenCalled();

                var o = {};
                expect(function () {
                    spy.receive([], o);
                }).toThrow(err);

                expect(log).toHaveBeenCalledWith(err);
                expect(log.calls.first().object).toBe(o);
            });

        });

    });

});