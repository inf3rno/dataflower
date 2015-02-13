var df = require("../../df"),
    v8 = require("../../df.v8"),
    Factory = df.Factory;


describe("df.v8", function () {

    describe("module", function () {

        describe("test", function () {

            describe("throws error by failure", function () {

                var backup;
                beforeEach(function () {
                    backup = v8.stackFactory;
                    v8.stackFactory = new Factory();
                    delete (v8.error);
                });

                afterEach(function () {
                    v8.stackFactory = backup;
                    delete(v8.error);
                });

                it("is failing by wrong factory", function () {
                    expect(function () {
                        v8.test();
                    }).toThrow();

                    expect(v8.debug()).toBeDefined();
                    expect(v8.compatible()).toBe(false);
                });

            });

            it("recovered factory properly by teardown", function () {

                expect(function () {
                    v8.test();
                }).not.toThrow();

                expect(v8.debug()).toBe(false);
                expect(v8.compatible()).toBe(true);

            });
        });

    });
});


