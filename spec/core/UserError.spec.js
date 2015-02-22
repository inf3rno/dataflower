var df = require("dataflower"),
    UserError = df.UserError,
    InvalidArguments = df.InvalidArguments,
    InvalidResult = df.InvalidResult,
    InvalidConfiguration = df.InvalidConfiguration,
    StackTrace = df.StackTrace;

describe("core", function () {

    describe("UserError", function () {

        it("is an Error descendant", function () {

            expect(UserError.prototype instanceof Object).toBe(true);
            expect(UserError.prototype instanceof Error).toBe(true);
            expect(UserError.prototype instanceof SyntaxError).toBe(false);
        });

        describe("extend", function () {

            it("calls the extend function on the class", function () {

                var MyError = UserError.extend({a: 1}, {b: 2});
                var err = new MyError();
                expect(MyError.prototype instanceof UserError);
                expect(MyError.prototype.a).toBe(1);
                expect(MyError.b).toBe(2);
                expect(err.id).toBeDefined();
            });

        });

        describe("mixin", function () {

            it("calls the mixin function on the class", function () {

                var MyError = UserError.extend();
                MyError.mixin({a: 1});
                expect(MyError.a).toBe(1);

            });

        });

        describe("prototype", function () {

            describe("mixin", function () {

                it("calls the mixin function on the instance", function () {

                    var err = new UserError();
                    err.mixin({
                        a: 1
                    });
                    expect(err.a).toBe(1);
                    expect(UserError.prototype.a).toBeUndefined();
                });

                it("transforms message string to source object", function () {

                    var err = new UserError();
                    err.mixin("message");
                    expect(err.message).toBe("message");
                });

            });

            describe("init", function () {

                it("creates the stack getter", function () {

                    var err = new UserError();
                    expect(typeof (err.stack)).toBe("string");
                });

                it("creates the stackTrace object", function () {

                    var err = new UserError();
                    expect(err.stackTrace instanceof StackTrace).toBe(true);

                });
            });

        });

    });

    describe("InvalidArguments", function () {

        it("is an UserError descendant", function () {

            expect(InvalidArguments.prototype instanceof UserError).toBe(true);
        });

        describe("Empty", function () {

            it("is an InvalidArguments descendant", function () {

                expect(InvalidArguments.Empty.prototype instanceof InvalidArguments).toBe(true);

            });

        });

    });

    describe("InvalidResult", function () {

        it("is an UserError descendant", function () {

            expect(InvalidResult.prototype instanceof UserError).toBe(true);
        });

    });

    describe("InvalidConfiguration", function () {

        it("is an UserError descendant", function () {

            expect(InvalidConfiguration.prototype instanceof UserError).toBe(true);
        });
    });
});