var df = require("dataflower"),
    UserError = df.UserError;

describe("core", function () {

    describe("UserError", function () {

        describe("new instance", function () {

            it("can be distinguished from the native Error types with instanceof", function () {
                try {
                    throw new UserError();
                } catch (err) {
                    expect(err instanceof Error).toBe(true);
                    expect(err instanceof UserError).toBe(true);
                    expect(err instanceof SyntaxError).toBe(false);
                }
            });

            it("can be distinguished from descendant UserError types with instanceof", function () {
                var MyUserError = UserError.extend();
                try {
                    throw new UserError();
                } catch (err) {
                    expect(err instanceof MyUserError).toBe(false);
                }
            });

            it("can have descendant UserError types, which can be distinguished from each other", function () {
                var MyUserError = UserError.extend();
                var MyUserErrorDescendant = MyUserError.extend();
                var AnotherError = UserError.extend();
                try {
                    throw new MyUserErrorDescendant();
                } catch (err) {
                    expect(err instanceof MyUserErrorDescendant).toBe(true);
                    expect(err instanceof MyUserError).toBe(true);
                    expect(err instanceof UserError).toBe(true);
                    expect(err instanceof Error).toBe(true);
                    expect(err instanceof SyntaxError).toBe(false);
                    expect(err instanceof AnotherError).toBe(false);
                }
            });

        });

        describe("init", function () {

            it("generates an id", function () {

                expect(new UserError().id).not.toBe(new UserError().id);
            });

        });

    });
});