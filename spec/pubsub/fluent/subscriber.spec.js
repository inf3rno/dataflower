var ps = require("dataflower/pubsub"),
    psf = require("dataflower/pubsub.fluent"),
    df = require("dataflower"),
    Subscriber = ps.Subscriber,
    subscriber = psf.subscriber,
    InvalidArguments = df.InvalidArguments,
    dummy = df.dummy;

describe("pubsub.fluent", function () {

    describe("subscriber", function () {

        it("accepts Function argument", function () {

            var wrapper = subscriber(dummy);
            expect(wrapper.component instanceof Subscriber).toBe(true);
        });

        it("accepts Subscriber wrappers", function () {

            var wrapper = subscriber(dummy);
            expect(subscriber(wrapper)).toBe(wrapper);
        });

        it("accepts Subscribers", function () {

            var wrapper = subscriber(dummy);
            expect(subscriber(wrapper.component)).toBe(wrapper);
        });

        it("accepts options", function () {

            var wrapper = subscriber({
                callback: dummy
            });
            expect(wrapper.component instanceof Subscriber).toBe(true);
        });

        it("does not accept empty arguments", function () {

            expect(subscriber).toThrow(new InvalidArguments.Empty());
        });

        it("does not accept multiple arguments", function () {

            expect(function () {
                subscriber(dummy, {});
            }).toThrow(new InvalidArguments());
        });

        it("does not accept invalid type of arguments", function () {

            expect(function () {
                subscriber("string");
            }).toThrow(new InvalidArguments());
        });

    });

});
