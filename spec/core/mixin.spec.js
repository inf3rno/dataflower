var df = require("dataflower"),
    merge = df.merge;

describe("core", function () {

    describe("merge", function () {

        it("calls the merge function of the subject with the arguments", function () {

            var o = {};
            var subject = {
                merge: jasmine.createSpy().and.callFake(function () {
                    return o;
                })
            };
            expect(merge(subject, 1, 2, 3)).toBe(o);
            expect(subject.merge).toHaveBeenCalledWith(1, 2, 3);
        });

        it("calls shallowCopy if no merge function set", function () {

            var subject = {};
            expect(merge(subject, {a: 1}, {b: 2}, {a: 3, c: 4})).toBe(subject);
            expect(subject).toEqual({b: 2, a: 3, c: 4});
        });

    });

});
