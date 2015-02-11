var df = require("../df");

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

        describe("isCompatible", function () {

            it("calls test once", function () {

                var plugin = new Plugin({
                    test: jasmine.createSpy()
                });
                var result;
                plugin.test.and.callFake(function () {
                    return result;
                });
                expect(plugin.test).not.toHaveBeenCalled();

                result = true;
                expect(plugin.isCompatible()).toBe(true);
                expect(plugin.test).toHaveBeenCalled();

                result = false;
                expect(plugin.isCompatible()).toBe(true);
                expect(plugin.test.calls.count()).toBe(1);
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
                            return false;
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

});