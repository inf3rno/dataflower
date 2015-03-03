var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    InvalidArguments = df.InvalidArguments,
    Publisher = ps.Publisher,
    Subscription = ps.Subscription,
    Listener = ps.Listener;

describe("pubsub", function () {

    describe("Listener", function () {

        it("is a Publisher descendant", function () {

            expect(Listener.prototype instanceof Publisher).toBe(true);

        });

        describe("prototype", function () {

            describe("init", function () {

                it("accepts only object as subject", function () {

                    var validEvent = "x";
                    expect(function () {
                        new Listener({
                            subject: {
                                on: function () {
                                }
                            },
                            event: validEvent
                        });
                    }).not.toThrow();

                    [
                        undefined,
                        "string",
                        123,
                        false
                    ].forEach(function (subject) {

                            expect(function () {
                                new Listener({
                                    subject: subject,
                                    event: validEvent
                                });
                            }).toThrow(new Listener.SubjectRequired());

                        });

                });

                it("accepts only string as event", function () {

                    var validSubject = {
                        on: function () {
                        }
                    };

                    [
                        undefined,
                        123,
                        false,
                        {},
                        function () {
                        }
                    ].forEach(function (event) {

                            expect(function () {
                                new Listener({
                                    subject: validSubject,
                                    event: event
                                });
                            }).toThrow(new Listener.EventRequired());

                        });

                });

                it("adds the wrapper as an event listener of the subject", function () {

                    var subject = {
                        on: jasmine.createSpy()
                    };
                    var listener = new Listener({
                        subject: subject,
                        event: "x"
                    });
                    expect(subject.on).toHaveBeenCalledWith("x", listener.toFunction());

                });

            });

        });

    });
});