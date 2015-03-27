var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Publisher = ps.Publisher,
    Watcher = ps.Watcher,
    Subscriber = ps.Subscriber;

describe("pubsub", function () {

    describe("Watcher", function () {

        it("is a Publisher descendant", function () {

            expect(Watcher.prototype instanceof Publisher).toBe(true);

        });

        describe("prototype", function () {

            describe("configure", function () {

                it("adds watcher on subject property changes which publishes", function () {

                    var o = {};
                    var watcher = new Watcher({
                        subject: o,
                        property: "x"
                    });
                    var log = jasmine.createSpy();
                    var subscriber = new Subscriber({
                        callback: log
                    });
                    watcher.add(subscriber);
                    expect(log).not.toHaveBeenCalled();
                    o.x = 123;
                    expect(log).toHaveBeenCalledWith(123, undefined, "x", o);
                });

            });

        });

    });
});