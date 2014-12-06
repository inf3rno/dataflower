var df = require("../df"),
    uniqueId = df.uniqueId;

describe("df", function () {

    describe("uniqueId", function () {

        it("returns unique id", function () {
            var store = {};
            for (var i = 0; i < 1000; ++i) {
                var id = uniqueId();
                if (id in store)
                    break;
                store[id] = true;
            }
            expect(i).toBe(1000);
        });

    });

});
