var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Subscriber = ps.Subscriber,
    Emitter = ps.Emitter,
    EventEmitter = require("events").EventEmitter,
    dummy = df.dummy;

describe("pubsub", function () {

    describe("Emitter", function () {

        it("is a Subscriber descendant", function () {

            expect(Emitter.prototype instanceof Subscriber).toBe(true);
        });

        describe("prototype", function () {

            describe("configure", function () {

                it("accepts only object as subject", function () {

                    var event = "x";
                    expect(function () {
                        new Emitter({
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
                                new Emitter({
                                    subject: invalidSubject,
                                    event: event
                                });
                            }).toThrow(new Emitter.SubjectRequired());
                        });
                });

                it("accepts only string as event", function () {

                    var eventEmitter = new EventEmitter();

                    [
                        null,
                        undefined,
                        123,
                        false,
                        {},
                        dummy
                    ].forEach(function (invalidEvent) {
                            expect(function () {
                                new Emitter({
                                    subject: eventEmitter,
                                    event: invalidEvent
                                });
                            }).toThrow(new Emitter.EventRequired());
                        });
                });

                it("emits messages as subject events", function () {

                    var mockEventEmitter = {
                        emit: jasmine.createSpy()
                    };
                    var emitter = new Emitter({
                        subject: mockEventEmitter,
                        event: "x"
                    });
                    emitter.activate([1, 2, 3]);
                    expect(mockEventEmitter.emit).toHaveBeenCalledWith("x", 1, 2, 3);
                });

            });

        });
    });
});