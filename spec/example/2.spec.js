var df = require("dflo2");

describe("example", function () {

    describe("2. wrapper, user errors, plugins", function () {

        it("implements wrapper", function () {

            var m = jasmine.createSpy();
            var o = {
                m: m
            };
            var p = jasmine.createSpy().and.callFake(function () {
                return arguments;
            });
            o.m = new df.Wrapper().wrap({
                preprocessors: [p],
                done: o.m,
                logic: df.Wrapper.logic.preprocessor.cascade
            });
            o.m(1, 2, 3);
            expect(m).toHaveBeenCalledWith(1, 2, 3);
            expect(p).toHaveBeenCalledWith(1, 2, 3);
        });

        it("implements UserError", function () {
            var MyUserError = df.UserError.extend({
                    name: "MyError"
                }),
                MyUserErrorDescendant = MyUserError.extend({
                    message: "Something really bad happened."
                }),
                AnotherDescendant = MyUserError.extend(),
                throwMyErrorDescendant = function () {
                    throw new MyUserErrorDescendant();
                };

            expect(throwMyErrorDescendant).toThrow(new MyUserErrorDescendant());

            try {
                throwMyErrorDescendant();
            } catch (err) {
                expect(err instanceof MyUserErrorDescendant).toBe(true);
                expect(err instanceof MyUserError).toBe(true);
                expect(err instanceof df.UserError).toBe(true);
                expect(err instanceof Error).toBe(true);

                expect(err instanceof AnotherDescendant).toBe(false);
                expect(err instanceof SyntaxError).toBe(false);

                expect(err.stack).toBeDefined();
            }

        });

        it("implements Plugin", function () {

            var plugin = new df.Plugin({
                test: function () {
                    throw new Error();
                },
                setup: function () {
                    console.log("Installing plugin.");
                }
            });
            if (plugin.compatible())
                plugin.install(); // won't install because of failing test
            expect(plugin.installed).toBe(false);
        });

    });

});