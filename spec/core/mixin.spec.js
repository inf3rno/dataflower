var df = require("dataflower"),
    mixin = df.mixin;

describe("core", function () {

    describe("mixin", function () {

        it("calls the mixin function of the subject with the arguments", function () {

            var o = {};
            var subject = {
                mixin: jasmine.createSpy().and.callFake(function () {
                    return o;
                })
            };
            expect(mixin(subject, 1, 2, 3)).toBe(o);
            expect(subject.mixin).toHaveBeenCalledWith(1, 2, 3);
        });

        it("calls shallowCopy if no mixin function set", function () {

            var subject = {};
            expect(mixin(subject, {a: 1}, {b: 2}, {a: 3, c: 4})).toBe(subject);
            expect(subject).toEqual({b: 2, a: 3, c: 4});
        });

    });

});
