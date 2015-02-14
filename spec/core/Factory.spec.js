var df = require("dflo2"),
    Factory = df.Factory;

describe("core", function () {

    describe("Factory", function () {

        describe("init", function () {

            it("accepts configuration options", function () {

                var o = {
                        x: {}
                    },
                    factory = new Factory(o);
                expect(factory.x).toBe(o.x);
            });

        });

        describe("create", function () {

            it("returns undefined", function () {

                var factory = new Factory({}),
                    instance = factory.create();
                expect(instance).toBeUndefined();

            });

        });
    });
});