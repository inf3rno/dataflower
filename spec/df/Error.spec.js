var df = require("dflo2");
var NativeError = Error;

describe("df", function () {

    var Error = df.Error;

    describe("Error", function () {

        describe("new instance", function () {

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

        });

        describe("init", function () {

            it("generates an id", function () {

                expect(new Error().id).not.toBe(new Error().id);
            });

        });

    });
});