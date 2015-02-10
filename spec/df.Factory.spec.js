var df = require("../df");

describe("df", function () {

    var Factory = df.Factory;

    describe("Factory", function () {

        describe("init", function () {

            it("accepts configuration options", function () {

                var o = {
                    x: {}
                };
                var factory = new Factory(o);
                expect(factory.x).toBe(o.x);
            });

        });

        describe("create", function () {

            it("returns undefined", function () {

                var factory = new Factory({});
                var instance = factory.create();
                expect(instance).toBeUndefined();

            });

        });
    });
});