var df = require("../df");
var NativeError = Error;

describe("df", function () {

    var Error = df.Error;

    describe("Error", function () {

        it("can be distinguished from the native Error types with instanceof", function () {
            try {
                throw new Error();
            } catch (err) {
                expect(err instanceof NativeError).toBe(true);
                expect(err instanceof Error).toBe(true);
                expect(err instanceof SyntaxError).toBe(false);
            }
        });

        it("can be distinguished from descendant Error types with instanceof", function () {
            var CustomError = Error.extend();
            try {
                throw new Error();
            } catch (err) {
                expect(err instanceof CustomError).toBe(false);
            }
        });

        it("can have descendant Error types, which can be distinguished from each other", function () {
            var CustomError = Error.extend();
            var CustomErrorDescendant = CustomError.extend();
            var AnotherError = Error.extend();
            try {
                throw new CustomErrorDescendant();
            } catch (err) {
                expect(err instanceof CustomErrorDescendant).toBe(true);
                expect(err instanceof CustomError).toBe(true);
                expect(err instanceof Error).toBe(true);
                expect(err instanceof NativeError).toBe(true);
                expect(err instanceof SyntaxError).toBe(false);
                expect(err instanceof AnotherError).toBe(false);
            }
        });

        it("puts only the calls happened before the instantiation, into the stack", function () {
            function customFunction() {
                throw new Error({
                    name: "CustomError",
                    message: "CustomMessage"
                });
            }

            try {
                customFunction();
            }
            catch (err) {
                var stack = err.stack;
                if (stack === undefined) {
                    console.warn("Stack creation compatibility issue at df.Error.\nYou won't be able to read the stack of custom errors in this environment.");
                    return;
                }
                expect(typeof(stack)).toBe("string");
                var expectedFormat = /^CustomError\s+CustomMessage\s+at\s+customFunction\s+.*$/m;
                expect(expectedFormat.test(stack)).toBe(true);
            }

        });

    });
});