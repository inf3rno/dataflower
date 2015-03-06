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
                expect(spy.returned instanceof Publisher).toBe(true);
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

            it("returns the result of the call", function () {

                var spy = new Spy({
                    callback: function () {
                        return 123;
                    }
                });
                expect(spy.receive([], {})).toBe(123);
            });

            it("publishes the result of the call on the returned Publisher", function () {

                var spy = new Spy({
                    callback: function () {
                        return 123;
                    }
                });
                var log = jasmine.createSpy();
                new Subscription({
                    publisher: spy.returned,
                    subscriber: new Subscriber({
                        callback: log
                    })
                });

                expect(log).not.toHaveBeenCalled();

                var o = {};
                spy.receive([], o);

                expect(log).toHaveBeenCalledWith(123);
                expect(log.calls.first().object).toBe(o);
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
                expect(wrapper.returned).toBe(spy.returned.toFunction());
            });

            describe("wrapper returned by toFunction", function () {

                it("returns the result of the receive", function () {

                    var spy = new Spy({
                        callback: function () {
                            return 123;
                        }
                    });
                    var wrapper = spy.toFunction();
                    expect(wrapper()).toBe(123);
                });

            });

        });

    });

});