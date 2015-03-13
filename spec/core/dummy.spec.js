var df = require("dataflower"),
    dummy = df.dummy;

describe("core", function () {

    describe("dummy", function () {

        it("does nothing", function () {
            expect(dummy(1, 2, 3)).toBe(undefined);
        });

    });

});
