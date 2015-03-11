var df = require("dataflower"),
    shallowMerge = df.shallowMerge,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("shallowMerge", function () {

        it("accepts any type of object as subject and sources", function () {

            expect(function () {
                shallowMerge({}, []);
                shallowMerge({}, [{}]);
                shallowMerge({}, [{}, {}]);
                shallowMerge(function () {
                }, [function () {
                }, function () {
                }]);
                shallowMerge(new Date(), [new RegExp(), function () {
                }, []]);
                shallowMerge({}, [null]);
                shallowMerge({}, [undefined]);
            }).not.toThrow();

            expect(function () {
                shallowMerge({}, [1, 2, 3]);
            }).toThrow(new InvalidArguments());

            expect(function () {
                shallowMerge(null, []);
            }).toThrow(new InvalidArguments());

            expect(function () {
                shallowMerge(null, [{}]);
            }).toThrow(new InvalidArguments());

            expect(function () {
                shallowMerge(1, [{}]);
            }).toThrow(new InvalidArguments());

            expect(function () {
                shallowMerge({}, [false]);
            }).toThrow(new InvalidArguments());

            expect(function () {
                shallowMerge({}, {});
            }).toThrow(new InvalidArguments());
        });

        it("overrides properties of the subject with the properties of the sources", function () {

            var subject = {};
            shallowMerge(subject, [{a: 1}, {b: 2}, {a: 3, c: 4}]);
            expect(subject).toEqual({b: 2, a: 3, c: 4});
        });

        it("overrides native methods of the subject with the ones defined in the sources", function () {
            var subject = {};
            var toString = function () {
                return "";
            };
            shallowMerge(subject, [{toString: toString}]);
            expect(subject.toString).toBe(toString);
        });

        it("returns the subject", function () {

            var subject = {};
            expect(shallowMerge(subject, [])).toBe(subject);
            expect(shallowMerge(subject, [{a: 1}, {b: 2}])).toBe(subject);
        });

    });


});
