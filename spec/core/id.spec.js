var df = require("dataflower"),
    id = df.id;

describe("core", function () {

    describe("id", function () {

        it("returns unique id", function () {
            var store = {};
            for (var i = 0; i < 10; ++i) {
                var current = id();
                if (current in store)
                    break;
                store[current] = true;
            }
            expect(i).toBe(10);
        });

        describe("last", function () {

            it("contains the last id", function () {

                expect(id()).toBe(id.last);
                expect(id()).toBe(id.last);
            });

            it("cannot be changed externally", function () {

                var lastId = id.last;
                ++id.last;
                expect(lastId).toBe(id.last);
            });

        });

        describe("set", function () {

            it("sets an id on an Object", function () {

                var o = {};
                id.set(o);
                expect(o.id).toBeDefined();
                var descriptor = Object.getOwnPropertyDescriptor(o, "id");
                expect(descriptor.configurable).toBe(false);
            });
        });

    });

});
