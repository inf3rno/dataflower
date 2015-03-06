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

        describe("init", function () {

            it("creates an error and a done Publisher", function () {

                var spy = new Spy({
                    callback: function () {
                    }
                });
                expect(spy.called instanceof Publisher).toBe(true);
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
                    publisher: spy.called,
                    subscriber: new Subscriber({
                        callback: log
                    })
                });
                var o = {
                    m: spy.toFunction()
                };
                o.m(1, 2, 3);
                expect(log).toHaveBeenCalledWith(1, 2, 3);
                expect(log.calls.count()).toBe(2);
                expect(log.calls.first()).toEqual(log.calls.mostRecent());
            });

        });

        describe("toFunction", function () {

            it("returns a wrapper which contains the called wrapper", function () {

                var spy = new Spy({
                    callback: function () {
                    }
                });
                var wrapper = spy.toFunction();
                expect(wrapper.called).toBe(spy.called.toFunction());
            });

        });

    });

});