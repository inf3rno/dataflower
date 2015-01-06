var df = require("../df");

describe("df", function () {

    var Sequence = df.Sequence;

    describe("Sequence", function () {

        it("generates the next state from the previous state", function () {
            var series = new Sequence({
                generator: function (previous) {
                    return ++previous;
                },
                state: 0
            });
            expect(series.state).toBe(0);
            expect(series.next()).toBe(1);
            expect(series.next()).toBe(2);
            expect(series.next()).toBe(3);
        });

        it("returns a wrapper which calls next state", function () {
            var series = new Sequence({
                generator: function (i) {
                    return ++i;
                },
                state: 0
            });
            var wrapper = series.wrap();
            expect(wrapper.sequence).toBe(series);
            expect(wrapper()).toBe(1);
            expect(wrapper()).toBe(2);
            expect(wrapper()).toBe(3);
            expect(series.state).toBe(3);
        });

        it("accepts additional parameters", function () {
            var sequence = new Sequence({
                generator: function (i, j) {
                    return i + j;
                },
                state: 0
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
                state: 0
            });
            var wrapper = sequence.wrap(10);
            expect(wrapper(5)).toBe(15);
            expect(sequence.next(1, 2)).toBe(18);
            expect(wrapper(2)).toBe(30);
        });

        it("works by passing the config parameters with extension", function () {
            var Series = Sequence.extend({
                generator: function (previous) {
                    return ++previous;
                },
                state: 0
            });
            var series = new Series();
            expect(series.state).toBe(0);
            expect(series.next()).toBe(1);
            expect(series.next()).toBe(2);
        });

    });

});
