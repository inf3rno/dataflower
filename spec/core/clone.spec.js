var df = require("dataflower"),
    clone = df.clone;

describe("core", function () {

    describe("clone", function () {

        it("returns the same primitives and Function", function () {
            [
                undefined,
                null,
                "string",
                123,
                true,
                false,
                function () {
                }
            ].forEach(function (value) {
                    expect(clone(value)).toBe(value);
                });
        });

        it("returns a different Array with the same values", function () {

            var a = [{}, 1, 2, 3];
            var b = clone(a);
            expect(b).toEqual(a);
            expect(b).not.toBe(a);
            expect(b[0]).toBe(a[0]);
        });

        it("returns a different Date with the same time", function () {

            var a = new Date();
            var b = clone(a);
            expect(b instanceof Date);
            expect(b).not.toBe(a);
            expect(b.toString()).toBe(a.toString());
        });

        it("returns a different RegExp with the same pattern and flags", function () {

            var a = /\w/gm;
            var b = clone(a);
            expect(b instanceof RegExp);
            expect(b).not.toBe(a);
            expect(b.toString()).toBe(a.toString());
        });

        it("returns a descendant Object created with Object.create", function () {

            var a = {x: {}, y: 1};
            var b = clone(a);
            expect(b).not.toBe(a);
            expect(b.x).toBe(a.x);
            a.y = 2;
            expect(b.y).toBe(a.y);
            b.y = 3;
            expect(b.y).not.toBe(a.y);
        });

        it("calls clone if the Object has such a method", function () {

            var a = {
                clone: function () {
                    return b;
                }
            };
            var b = {};
            expect(clone(a)).toBe(b);
        });

    });

});
