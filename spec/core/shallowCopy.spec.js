var df = require("dataflower"),
    shallowCopy = df.shallowCopy,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("shallowCopy", function () {

        it("accepts any type of object as subject and sources", function () {

            expect(function () {
                shallowCopy({});
                shallowCopy({}, {});
                shallowCopy({}, {}, {});
                shallowCopy(function () {
                }, function () {
                }, function () {
                });
                shallowCopy(new Date(), new RegExp(), function () {
                }, []);
                shallowCopy({}, null);
                shallowCopy({}, undefined);
            }).not.toThrow();

            expect(function () {
                shallowCopy({}, 1, 2, 3);
            }).toThrow(new InvalidArguments());

            expect(function () {
                shallowCopy(null);
            }).toThrow(new InvalidArguments());

            expect(function () {
                shallowCopy(null, {});
            }).toThrow(new InvalidArguments());

            expect(function () {
                shallowCopy(1, {});
            }).toThrow(new InvalidArguments());

            expect(function () {
                shallowCopy({}, false);
            }).toThrow(new InvalidArguments());
        });

        it("overrides properties of the subject with the properties of the sources", function () {

            var subject = {};
            shallowCopy(subject, {a: 1}, {b: 2}, {a: 3, c: 4});
            expect(subject).toEqual({b: 2, a: 3, c: 4});
        });

        it("overrides native methods of the subject with the ones defined in the sources", function () {
            var subject = {};
            var toString = function () {
                return "";
            };
            shallowCopy(subject, {toString: toString});
            expect(subject.toString).toBe(toString);
        });

        it("returns the subject", function () {

            var subject = {};
            expect(shallowCopy(subject)).toBe(subject);
            expect(shallowCopy(subject, {a: 1}, {b: 2})).toBe(subject);
        });

    });


});
