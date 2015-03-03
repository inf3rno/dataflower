var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Publisher = ps.Publisher,
    Getter = ps.Getter,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription;

describe("pubsub", function () {

    describe("Getter", function () {

        it("is a Publisher descendant", function () {

            expect(Getter.prototype instanceof Publisher).toBe(true);

        });

        describe("prototype", function () {

            describe("init", function () {

                it("accepts only object as subject", function () {

                    var validProperty = "x";
                    expect(function () {
                        new Getter({
                            subject: {},
                            property: validProperty
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
                                new Getter({
                                    subject: subject,
                                    property: validProperty
                                });
                            }).toThrow(new Getter.SubjectRequired());

                        });

                });

                it("accepts only string as property", function () {

                    var validSubject = {};

                    [
                        undefined,
                        123,
                        false,
                        {},
                        function () {
                        }
                    ].forEach(function (property) {

                            expect(function () {
                                new Getter({
                                    subject: validSubject,
                                    property: property
                                });
                            }).toThrow(new Getter.PropertyRequired());

                        });

                });

                it("publishes the value of the subject's property", function () {

                    var subject = {};
                    var getter = new Getter({
                        subject: subject,
                        property: "x"
                    });
                    var log = jasmine.createSpy();
                    var subscriber = new Subscriber({
                        callback: log
                    });
                    var subscription = new Subscription({
                        publisher: getter,
                        subscriber: subscriber
                    });
                    expect(log).not.toHaveBeenCalled();

                    getter.publish([]);
                    expect(log).toHaveBeenCalledWith(undefined);
                    expect(log.calls.first().object).toBe(subject);

                    subject.x = 123;
                    getter.publish([]);
                    expect(log).toHaveBeenCalledWith(123);

                    getter.publish([1, 2, 3]);
                    expect(log).toHaveBeenCalledWith(123, 1, 2, 3);

                    var context = {};
                    getter.publish([], context);
                    expect(log.calls.mostRecent().object).toBe(subject);
                });

            });

        });

    });
});