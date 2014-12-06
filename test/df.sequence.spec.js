var df = require("../df"),
    Sequence = df.Sequence;

describe("df", function () {

    describe("Sequence", function () {

        it("generates the next state from the previous state", function () {
            var continuouslyIncreasingSequence = new Sequence({
                generator: function (previous) {
                    return ++previous;
                },
                initial: 0
            });
            expect(continuouslyIncreasingSequence.get()).toBe(0);
            expect(continuouslyIncreasingSequence.next()).toBe(1);
            expect(continuouslyIncreasingSequence.next()).toBe(2);
            expect(continuouslyIncreasingSequence.next()).toBe(3);
        });

        it("returns a wrapper which calls next state", function () {
            var sequence = new Sequence({
                generator: function (i) {
                    return ++i;
                },
                initial: 0
            });
            var wrapper = sequence.wrap();
            expect(wrapper()).toBe(1);
            expect(wrapper()).toBe(2);
            expect(wrapper()).toBe(3);
            expect(sequence.get()).toBe(3);
        });

        it("accepts additional parameters", function () {
            var sequence = new Sequence({
                generator: function (i, j) {
                    return i + j;
                },
                initial: 0
            });
            var wrapper = sequence.wrap();
            expect(sequence.next(1)).toBe(1);
            expect(sequence.next(2)).toBe(3);
            expect(wrapper(5)).toBe(8);
        });

        it("stores additional parameters in the wrapper", function () {
            var sequence = new Sequence({
                generator: function (i, j, k) {
                    return i + j + k;
                },
                initial: 0
            });
            var wrapper = sequence.wrap(10);
            expect(wrapper(5)).toBe(15);
            expect(sequence.next(1, 2)).toBe(18);
            expect(wrapper(2)).toBe(30);
        });

    });

});
