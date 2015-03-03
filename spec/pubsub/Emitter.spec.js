var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Subscriber = ps.Subscriber,
    Emitter = ps.Emitter;

describe("pubsub", function () {

    describe("Emitter", function () {

        it("is a Subscriber descendant", function () {

            expect(Emitter.prototype instanceof Subscriber).toBe(true);

        });

        describe("prototype", function () {

            describe("init", function () {

                it("accepts only object as subject", function () {

                    var validEvent = "x";
                    expect(function () {
                        new Emitter({
                            subject: {
                                on: function () {
                                }
                            },
                            event: validEvent
                        });
                    }).not.toThrow();

                    [
                        null,
                        undefined,
                        "string",
                        123,
                        false
                    ].forEach(function (subject) {

                            expect(function () {
                                new Emitter({
                                    subject: subject,
                                    event: validEvent
                                });
                            }).toThrow(new Emitter.SubjectRequired());

                        });

                });

                it("accepts only string as event", function () {

                    var validSubject = {
                        on: function () {
                        }
                    };

                    [
                        null,
                        undefined,
                        123,
                        false,
                        {},
                        function () {
                        }
                    ].forEach(function (event) {

                            expect(function () {
                                new Emitter({
                                    subject: validSubject,
                                    event: event
                                });
                            }).toThrow(new Emitter.EventRequired());

                        });

                });

                it("emits messages as subject events", function () {

                    var subject = {
                        trigger: jasmine.createSpy()
                    };
                    var emitter = new Emitter({
                        subject: subject,
                        event: "x"
                    });
                    emitter.receive([1, 2, 3]);
                    expect(subject.trigger).toHaveBeenCalledWith("x", 1, 2, 3);

                });

            });

        });
    });
});