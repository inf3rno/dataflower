var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Publisher = ps.Publisher,
    Listener = ps.Listener,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription;

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
                        null,
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
                        null,
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

                it("uses the subject as context", function () {

                    var subject = {
                        on: function (type, listener) {
                            this.listener = listener;
                        },
                        trigger: function () {
                            this.listener.apply(null, []);
                        }
                    };
                    var listener = new Listener({
                        subject: subject,
                        event: "x"
                    });
                    var log = jasmine.createSpy();
                    var subscriber = new Subscriber({
                        callback: log
                    });
                    var subscription = new Subscription({
                        publisher: listener,
                        subscriber: subscriber
                    });

                    expect(log).not.toHaveBeenCalled();

                    subject.trigger();
                    expect(log).toHaveBeenCalled();
                    expect(log.calls.first().object).toBe(subject);

                    var context = {};
                    listener.publish([], context);
                    expect(log.calls.mostRecent().object).toBe(subject);
                });

            });

        });

    });
});