var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Publisher = ps.Publisher,
    Listener = ps.Listener,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription,
    EventEmitter = require("events").EventEmitter,
    dummy = df.dummy;

describe("pubsub", function () {

    describe("Listener", function () {

        it("is a Publisher descendant", function () {

            expect(Listener.prototype instanceof Publisher).toBe(true);
        });

        describe("prototype", function () {

            describe("configure", function () {

                it("accepts only object as subject", function () {

                    var event = "x";
                    expect(function () {
                        new Listener({
                            subject: new EventEmitter(),
                            event: event
                        });
                    }).not.toThrow();

                    [
                        null,
                        undefined,
                        "string",
                        123,
                        false
                    ].forEach(function (invalidSubject) {
                            expect(function () {
                                new Listener({
                                    subject: invalidSubject,
                                    event: event
                                });
                            }).toThrow(new Listener.SubjectRequired());
                        });
                });

                it("accepts only string as event", function () {

                    var mockEventEmitter = {
                        on: dummy
                    };

                    [
                        null,
                        undefined,
                        123,
                        false,
                        {},
                        dummy
                    ].forEach(function (invalidEvent) {
                            expect(function () {
                                new Listener({
                                    subject: mockEventEmitter,
                                    event: invalidEvent
                                });
                            }).toThrow(new Listener.EventRequired());
                        });
                });

                it("adds the wrapper as an event listener of the subject", function () {

                    var mockEventEmitter = {
                        on: jasmine.createSpy()
                    };

                    var listener = new Listener({
                        subject: mockEventEmitter,
                        event: "x"
                    });
                    expect(mockEventEmitter.on).toHaveBeenCalledWith("x", listener.toFunction());
                });

                it("uses the subject as context", function () {

                    var eventEmitter = new EventEmitter();
                    var listener = new Listener({
                        subject: eventEmitter,
                        event: "x"
                    });
                    var log = jasmine.createSpy();
                    var subscriber = new Subscriber({
                        callback: log
                    });
                    var subscription = new Subscription({
                        items: [
                            listener,
                            subscriber
                        ]
                    });

                    expect(log).not.toHaveBeenCalled();

                    eventEmitter.emit("x");
                    expect(log).toHaveBeenCalled();
                    expect(log.calls.first().object).toBe(eventEmitter);

                    var context = {};
                    listener.publish([], context);
                    expect(log.calls.mostRecent().object).toBe(eventEmitter);
                });

            });

        });

    });
});