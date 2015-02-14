var df = require("dflo2");

describe("example", function () {

    describe("2. container, factory, user errors, plugins", function () {

        it("implements container, factory", function () {

            var log = jasmine.createSpy(),
                Cat = df.Base.extend({
                    color: undefined,
                    name: undefined,
                    init: function (options) {
                        this.configure(options);
                        if (typeof(this.color) != "string")
                            throw new df.InvalidConfiguration("Color not defined.");
                        if (typeof (this.name) != "string")
                            throw new df.InvalidConfiguration("Name is not defined.");
                    },
                    meow: function () {
                        log(this.color + " " + this.name + ": meow");
                    }
                }, {
                    instance: new df.Container().add({
                        factory: df.Factory.extend({
                            create: function (Cat, options) {
                                if (arguments.length != 2)
                                    throw new df.InvalidArguments();
                                if (!this.isOptions(options))
                                    throw new df.InvalidArguments();
                                return new Cat(options);
                            }
                        }).instance(),
                        isDefault: true
                    }).add(df.Factory.extend({
                        create: function (Cat, color, name) {
                            if (arguments.length == 3)
                                return Cat.instance({
                                    color: color,
                                    name: name
                                });
                        }
                    }).instance()).wrap({
                        passContext: true
                    })
                }),
                WhiteCat = Cat.extend({
                    color: "white"
                });

            Cat.instance.container.add(df.Factory.extend({
                create: function (Cat, name) {
                    if (arguments.length != 2)
                        return;
                    if (typeof(name) == "string")
                        return Cat.instance({
                            name: name
                        });
                }
            }).instance());

            var kitty = Cat.instance("orange", "Kitty");
            kitty.meow();
            expect(log).toHaveBeenCalledWith("orange Kitty: meow");
            var killer = WhiteCat.instance("Killer");
            killer.meow();
            expect(log).toHaveBeenCalledWith("white Killer: meow");

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