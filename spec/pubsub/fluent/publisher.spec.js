var ps = require("dataflower/pubsub"),
    psf = require("dataflower/pubsub.fluent"),
    df = require("dataflower"),
    Publisher = ps.Publisher,
    publisher = psf.publisher,
    InvalidArguments = df.InvalidArguments;

describe("pubsub.fluent", function () {

    describe("publisher", function () {

        it("accepts empty arguments", function () {

            var wrapper = publisher();
            expect(wrapper.component instanceof Publisher).toBe(true);
        });

        it("accepts Publisher wrappers", function () {

            var wrapper = publisher();
            expect(publisher(wrapper)).toBe(wrapper);
        });

        it("accepts Publishers", function () {

            var wrapper = publisher();
            expect(publisher(wrapper.component)).toBe(wrapper);
        });

        it("accepts options", function () {

            var wrapper = publisher({x: 1});
            expect(wrapper.component.x).toBe(1);
        });

        it("does not accept multiple arguments", function () {

            expect(function () {
                publisher({}, {});
            }).toThrow(new InvalidArguments());
        });

        it("does not accept invalid type of arguments", function () {

            expect(function () {
                publisher("string");
            }).toThrow(new InvalidArguments());
        });

    });

});
