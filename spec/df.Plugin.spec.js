var df = require("../df"),
    NativeError = Error;

describe("df", function () {

    var Plugin = df.Plugin;

    describe("Plugin", function () {

        describe("init", function () {

            it("accepts configuration options", function () {

                var o = {
                    x: {}
                };
                var plugin = new Plugin(o);
                expect(plugin.x).toBe(o.x);
            });

        });

        describe("compatible", function () {

            it("calls test once", function () {

                var plugin = new Plugin({
                    test: jasmine.createSpy()
                });
                var shouldThrow;
                plugin.test.and.callFake(function () {
                    if (shouldThrow)
                        throw new NativeError();
                });
                expect(plugin.test).not.toHaveBeenCalled();

                shouldThrow = false;
                expect(plugin.compatible()).toBe(true);
                expect(plugin.test).toHaveBeenCalled();

                shouldThrow = true;
                expect(plugin.compatible()).toBe(true);
                expect(plugin.test.calls.count()).toBe(1);
            });

        });

        describe("debug", function () {

            it("returns the error if the test failed", function () {

                var error = new NativeError();
                var plugin = new Plugin({
                    test: function () {
                        throw error;
                    }
                });
                expect(plugin.debug()).toBe(error);

            });

        });

        describe("install", function () {

            it("calls setup once", function () {

                var plugin = new Plugin({
                    setup: jasmine.createSpy()
                });

                expect(plugin.setup).not.toHaveBeenCalled();
                plugin.install();
                expect(plugin.setup).toHaveBeenCalled();
                plugin.install();
                expect(plugin.setup.calls.count()).toBe(1);
            });

            it("checks compatibility before installing", function () {

                var plugin = new Plugin({
                    test: function () {
                        throw new NativeError();
                    },
                    setup: jasmine.createSpy()
                });

                expect(function () {
                    plugin.install();
                }).toThrow(new Plugin.Incompatible());

                expect(plugin.setup).not.toHaveBeenCalled();
            });

        });

    });

});