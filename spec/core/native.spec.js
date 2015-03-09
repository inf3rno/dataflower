var df = require("dataflower"),
    native = df.native;

describe("core", function () {

    describe("native", function () {

        it("it is an object literal", function () {

            expect(native instanceof Object).toBe(true);
        });

        describe("global", function () {

            it("contains the native Object, Error, etc...", function () {

                expect(native.global.Object).toBe(Object);
                expect(native.global.Error).toBe(Error);
            });

            it("writes the global namespace by any change", function () {

                expect(function () {
                    longlonglong;
                }).toThrow();
                native.global.longlonglong = 1;
                expect(function () {
                    longlonglong;
                }).not.toThrow();
                delete(native.global.longlonglong);
                expect(function () {
                    longlonglong;
                }).toThrow();
            });
        });

        describe("console", function () {

            it("is the native console", function () {

                expect(native.console).toBe(console);
                var backup = console;
                console = {};
                expect(native.console).toBe(backup);
                console = backup;
            });
        });
    });
});