var df = require("../df");

describe("example", function () {

    describe("1. inheritance, instantiation, configuration, cloning and unique id", function () {

        it("implements inheritance, instantiation, configuration, cloning", function () {
            var log = jasmine.createSpy();
            var Cat = df.Object.extend({
                init: function (name) {
                    this.name = name;
                    ++Cat.counter;
                },
                meow: function () {
                    log(this.name + ": meow");
                }
            }, {
                counter: 0,
                count: function () {
                    return this.counter;
                }
            });
            var kitty = new Cat("Kitty");
            var killer = Cat.instance("Killer");

            kitty.meow();
            expect(log).toHaveBeenCalledWith("Kitty: meow");
            expect(log).not.toHaveBeenCalledWith("Killer: meow");
            killer.meow();
            expect(log).toHaveBeenCalledWith("Killer: meow");
            expect(Cat.count()).toBe(2);

            kitty.configure({
                init: function (postfix) {
                    this.name += " " + postfix;
                }
            }, "Cat");
            kitty.meow();
            expect(log).toHaveBeenCalledWith("Kitty Cat: meow");
            kitty.init("from London");
            kitty.meow();
            expect(log).toHaveBeenCalledWith("Kitty Cat from London: meow");

            var kittyClone = Cat.clone(kitty);
            kittyClone.meow();
            expect(log).toHaveBeenCalledWith("Kitty Cat from London: meow");
        });

        it("implements unique id", function () {
            var id1 = df.id();
            var id2 = df.id();
            expect(id1).not.toBe(id2);
        });

    });


    describe("2. container, factory, custom errors, plugins", function () {

        it("implements container, factory", function () {

            var log = jasmine.createSpy();
            var Cat = df.Object.extend({
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
            });

            var WhiteCat = Cat.extend({
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

        it("implements custom Error", function () {
            var CustomError = df.Error.extend({
                name: "CustomError"
            });
            var CustomErrorSubType = CustomError.extend({
                message: "Something really bad happened."
            });
            var AnotherSubType = CustomError.extend();

            var throwCustomErrorSubType = function () {
                throw new CustomErrorSubType();
            };

            expect(throwCustomErrorSubType).toThrow(new CustomErrorSubType());

            try {
                throwCustomErrorSubType();
            } catch (err) {
                expect(err instanceof CustomErrorSubType).toBe(true);
                expect(err instanceof CustomError).toBe(true);
                expect(err instanceof df.Error).toBe(true);
                expect(err instanceof Error).toBe(true);

                expect(err instanceof AnotherSubType).toBe(false);
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
            if (plugin.isCompatible())
                plugin.install(); // won't install because of failing test
            expect(plugin.installed).toBe(false);
        });

    });

    describe("3. pub/sub pattern", function () {

        it("implements Publisher, Subscriber, Subscription", function () {
            var publisher = new df.Publisher();
            var log = jasmine.createSpy();
            new df.Subscription({
                publisher: publisher,
                subscriber: new df.Subscriber({
                    callback: log
                })
            });
            expect(log).not.toHaveBeenCalled();
            publisher.publish([1, 2, 3]);
            expect(log).toHaveBeenCalledWith(1, 2, 3);
            publisher.publish([4, 5, 6]);
            expect(log).toHaveBeenCalledWith(4, 5, 6);
        });

        it("implements static factory methods and wrapper functions", function () {
            var o = {
                send: df.Publisher.instance().wrap(),
                receive: jasmine.createSpy()
            };
            df.Subscription.instance(
                o.send.publisher,
                df.Subscriber.instance(o.receive)
            );
            expect(o.receive).not.toHaveBeenCalled();
            o.send(1, 2, 3);
            expect(o.receive).toHaveBeenCalledWith(1, 2, 3);
            o.send(4, 5, 6);
            expect(o.receive).toHaveBeenCalledWith(4, 5, 6);
        });

        it("implements factory functions", function () {
            var o = {
                send: df.publisher(),
                receive: jasmine.createSpy()
            };
            df.subscribe(o.send, o.receive);
            expect(o.receive).not.toHaveBeenCalled();
            o.send(1, 2, 3);
            expect(o.receive).toHaveBeenCalledWith(1, 2, 3);
            o.send(4, 5, 6);
            expect(o.receive).toHaveBeenCalledWith(4, 5, 6);
        });

        it("implements Subscriber.subscribe", function () {
            var o = {
                send: df.publisher(),
                receive: jasmine.createSpy()
            };
            df.subscriber(o.receive).subscribe(o.send);
            expect(o.receive).not.toHaveBeenCalled();
            o.send(1, 2, 3);
            expect(o.receive).toHaveBeenCalledWith(1, 2, 3);
            o.send(4, 5, 6);
            expect(o.receive).toHaveBeenCalledWith(4, 5, 6);
        });

    });


});