var df = require("dataflower");

describe("example", function () {

    describe("2. wrapper, user errors, plugins, hashSet", function () {

        it("implements wrapper", function () {

            var m = jasmine.createSpy();
            var o = {
                m: m
            };
            var p = jasmine.createSpy().and.callFake(function () {
                return Array.prototype.slice.apply(arguments);
            });
            o.m = new df.Wrapper({
                algorithm: df.Wrapper.algorithm.cascade,
                preprocessors: [p],
                done: o.m
            }).toFunction();
            o.m(1, 2, 3);
            expect(m).toHaveBeenCalledWith(1, 2, 3);
            expect(p).toHaveBeenCalledWith(1, 2, 3);
        });

        it("implements UserError", function () {

            var MyError = df.UserError.extend({
                    name: "MyError"
                }),
                MyErrorDescendant = MyError.extend({
                    message: "Something really bad happened."
                }),
                AnotherDescendant = MyError.extend(),
                throwMyErrorDescendant = function () {
                    throw new MyErrorDescendant();
                };

            expect(throwMyErrorDescendant).toThrow(new MyErrorDescendant());

            try {
                throwMyErrorDescendant();
            } catch (err) {
                expect(err instanceof MyErrorDescendant).toBe(true);
                expect(err instanceof MyError).toBe(true);
                expect(err instanceof df.UserError).toBe(true);
                expect(err instanceof Error).toBe(true);

                expect(err instanceof AnotherDescendant).toBe(false);
                expect(err instanceof SyntaxError).toBe(false);

                expect(err.stack).toBeDefined();
                expect(err.stack).toContain(err.name);
                expect(err.stack).toContain(err.message);
                expect(err.stack).toContain("throwMyErrorDescendant");
            }

        });

        it("implements CompositeError", function () {

            var MyCompositeError = df.CompositeError.extend({
                    name: "MyError",
                    message: "Something really bad caused this."
                }),
                throwMyUserError = function () {
                    throw new df.UserError("Something really bad happened.");
                },
                throwMyCompositeError = function () {
                    try {
                        throwMyUserError();
                    }
                    catch (cause) {
                        throw new MyCompositeError({
                            myCause: cause
                        });
                    }
                };

            expect(throwMyCompositeError).toThrow(new MyCompositeError());

            try {
                throwMyCompositeError();
            } catch (err) {
                expect(err instanceof MyCompositeError).toBe(true);
                expect(err instanceof df.CompositeError).toBe(true);
                expect(err instanceof df.UserError).toBe(true);
                expect(err.myCause instanceof df.UserError).toBe(true);
                expect(err.stack).toBeDefined();
                expect(err.stack).toContain(err.name);
                expect(err.stack).toContain(err.message);
                expect(err.stack).toContain(err.myCause.stack);
                expect(err.stack).toContain("throwMyCompositeError");
                expect(err.stack).toContain("throwMyUserError");
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

        it("implements HashSet", function () {

            var o = new df.Base(),
                o2 = {id: 123},
                o3 = new df.Base();
            var hashSet = new df.HashSet(o, o2);
            hashSet.add(o2, o3);
            expect(hashSet.contains(o, o2, o3)).toBe(true);
            hashSet.remove(o2);
            expect(hashSet.contains(o, o2, o3)).toBe(false);
            var log = jasmine.createSpy();
            for (var id in hashSet.items)
                log(hashSet.items[id]);
            expect(log).toHaveBeenCalledWith(o);
            expect(log).not.toHaveBeenCalledWith(o2);
            expect(log).toHaveBeenCalledWith(o3);
            log.calls.reset();

            var items = hashSet.toArray();
            for (var index in items)
                log(items[index]);
            expect(log).toHaveBeenCalledWith(o);
            expect(log).not.toHaveBeenCalledWith(o2);
            expect(log).toHaveBeenCalledWith(o3);
        });

    });

});