var df = require("dataflower"),
    watch = df.watch,
    unwatch = df.unwatch,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("unwatch", function () {

        it("accepts only Object instances as subject", function () {

            var property = "x";
            var listener = function () {
            };

            [
                null,
                undefined,
                123,
                false,
                "string"
            ].forEach(function (invalidSubject) {
                    expect(function () {
                        unwatch(invalidSubject, property, listener);
                    }).toThrow(new InvalidArguments());
                });
        });

        it("accepts only strings as property", function () {

            var subject = {};
            var listener = function () {
            };

            [
                null,
                undefined,
                123,
                false,
                {},
                function () {
                }
            ].forEach(function (invalidProperty) {
                    expect(function () {
                        unwatch(subject, invalidProperty, listener);
                    }).toThrow(new InvalidArguments());
                });
        });

        it("accepts only Function as listener", function () {

            var subject = {};
            var property = "x";

            [
                null,
                undefined,
                123,
                false,
                {},
                "string"
            ].forEach(function (invalidListener) {
                    expect(function () {
                        unwatch(subject, property, invalidListener);
                    }).toThrow(new InvalidArguments());
                });
        });

        it("does not throw if every argument is valid", function () {

            var subject = {};
            var property = "x";
            var listener = function () {
            };

            expect(function () {
                unwatch(subject, property, listener);
            }).not.toThrow();
        });

        it("stops listening to property changes", function () {

            var subject = {
                x: 1
            };
            var property = "x";
            var a = jasmine.createSpy();
            var b = jasmine.createSpy();

            watch(subject, property, a);
            watch(subject, property, b);

            expect(a).not.toHaveBeenCalled();
            expect(b).not.toHaveBeenCalled();

            ++subject.x;
            expect(a.calls.count()).toBe(1);
            expect(a).toHaveBeenCalledWith(2, 1, "x", subject);
            expect(b.calls.count()).toBe(1);
            expect(b).toHaveBeenCalledWith(2, 1, "x", subject);

            unwatch(subject, property, b);

            ++subject.x;
            expect(a.calls.count()).toBe(2);
            expect(b.calls.count()).toBe(1);
            expect(a).toHaveBeenCalledWith(3, 2, "x", subject);
            expect(b).not.toHaveBeenCalledWith(3, 2, "x", subject);

        });

    });

});
