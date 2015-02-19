var df = require("dataflower"),
    UserError = df.UserError,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration;

describe("core", function () {

    describe("UserError", function () {

        it("is an Error descendant", function () {

            expect(UserError.prototype instanceof Object).toBe(true);
            expect(UserError.prototype instanceof Error).toBe(true);
            expect(UserError.prototype instanceof SyntaxError).toBe(false);
        });

        describe("static", function () {

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

            describe("clone", function () {

                it("accepts only UserError relative instances", function () {

                    expect(function () {
                        UserError.clone(new UserError());
                        UserError.clone(new (UserError.extend()));
                    }).not.toThrow();

                    expect(function () {
                        UserError.clone({});
                    }).toThrow(new InvalidArguments());

                    expect(function () {
                        UserError.clone(new Error());
                    }).toThrow(new InvalidArguments());

                    expect(function () {
                        UserError.clone(null);
                    }).toThrow(new InvalidArguments());

                });

                it("calls clone on the instance", function () {
                    var err = new UserError();
                    var o = {};
                    err.clone = jasmine.createSpy().and.callFake(function () {
                        return o;
                    });
                    expect(UserError.clone(err)).toBe(o);
                    expect(err.clone).toHaveBeenCalled();
                });

            });

        });

        describe("mixin", function () {

            it("calls the mixin function on the instance", function () {

                var err = new UserError();
                err.mixin({
                    a: 1
                });
                expect(err.a).toBe(1);
                expect(UserError.prototype.a).toBeUndefined();
            });

        });

        describe("clone", function () {

            it("returns the same instance", function () {

                var err = new UserError();
                expect(err.clone()).toBe(err);
            });

        });

        describe("init", function () {

            it("creates the stack", function () {

                var err = new UserError();
                expect(typeof (err.stack)).toBe("string");
            });
        });

    });

    describe("InvalidArguments", function () {

        it("is an UserError descendant", function () {

            expect(InvalidArguments.prototype instanceof UserError).toBe(true);
        });

        describe("static", function () {

            describe("Empty", function () {

                it("is an InvalidArguments descendant", function () {

                    expect(InvalidArguments.Empty.prototype instanceof InvalidArguments).toBe(true);

                });

            });

        });

    });

    describe("InvalidConfiguration", function () {

        it("is an UserError descendant", function () {

            expect(InvalidConfiguration.prototype instanceof UserError).toBe(true);
        });
    });
});