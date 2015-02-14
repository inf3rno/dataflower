var df = require("dflo2"),
    id = df.id;

describe("core", function () {

    describe("id", function () {

        it("returns unique id", function () {
            var store = {};
            for (var i = 0; i < 1000; ++i) {
                var current = id();
                if (current in store)
                    break;
                store[current] = true;
            }
            expect(i).toBe(1000);
        });

    });

});
