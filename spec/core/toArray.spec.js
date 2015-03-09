var df = require("dataflower"),
    toArray = df.toArray,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("toArray", function () {

        it("accepts Arrays and Objects", function () {

            expect(function () {
                toArray([]);
                toArray(arguments);
                toArray({});
            }).not.toThrow();

            [
                undefined,
                null,
                "string",
                123,
                false,
                function () {
                }
            ].forEach(function (subject) {
                    expect(function () {
                        toArray(subject);
                    }).toThrow(new InvalidArguments());
                });

        });

        it("returns a different Array with the same values", function () {

            var a = [{}, 1, 2, 3];
            var b = toArray(a);
            expect(b).toEqual(a);
            expect(b).not.toBe(a);
            expect(b[0]).toBe(a[0]);
        });

        it("returns an Array with the Object properties", function () {

            var o = {
                a: 1, b: {}, c: function () {
                }
            };
            var arr = toArray(o);
            expect(arr).toEqual([o.a, o.b, o.c]);
            expect(arr[1]).toBe(o.b);
        });

        it("calls toArray if given", function () {

            var o = {
                toArray: function () {
                    return [1, 2, 3];
                }
            };
            expect(toArray(o)).toEqual([1, 2, 3]);
        });

    });
});