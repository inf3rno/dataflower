var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    Subscriber = ps.Subscriber,
    Setter = ps.Setter,
    dummy = df.dummy;

describe("pubsub", function () {

    describe("Setter", function () {

        it("is a Subscriber descendant", function () {

            expect(Setter.prototype instanceof Subscriber).toBe(true);
        });

        describe("prototype", function () {

            describe("configure", function () {

                it("accepts only object as subject", function () {

                    var validProperty = "x";
                    expect(function () {
                        new Setter({
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
                                new Setter({
                                    subject: subject,
                                    property: validProperty
                                });
                            }).toThrow(new Setter.SubjectRequired());
                        });
                });

                it("accepts only string as property", function () {

                    var subject = {
                        on: dummy
                    };

                    [
                        null,
                        undefined,
                        123,
                        false,
                        {},
                        dummy
                    ].forEach(function (invalidProperty) {
                            expect(function () {
                                new Setter({
                                    subject: subject,
                                    property: invalidProperty
                                });
                            }).toThrow(new Setter.PropertyRequired());
                        });
                });

                it("sets the property on the subject", function () {

                    var subject = {};
                    var setter = new Setter({
                        subject: subject,
                        property: "x"
                    });
                    setter.activate([123]);
                    expect(subject.x).toBe(123);
                });

            });

        });
    });
});