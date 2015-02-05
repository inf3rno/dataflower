var df = require("../df");

describe("example", function () {

    describe("1. inheritance, instantiation, configuration", function () {

        it("implements inheritance, instantiation, configuration", function () {
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
        });

    });


    describe("2. custom errors", function () {

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

    });


    describe("3. sequence, unique id", function () {

        it("implements Sequence, unique id", function () {
            var sequence = new df.Sequence({
                state: 10,
                generator: function (previousState) {
                    return previousState + 1;
                }
            });
            expect(sequence.state).toBe(10);
            expect(sequence.next()).toBe(11);
            expect(sequence.state).toBe(11);

            var wrapper = sequence.wrap();
            expect(wrapper.sequence).toBe(sequence);
            expect(wrapper()).toBe(12);
            expect(wrapper.sequence.state).toBe(12);

            var id1 = df.uniqueId();
            var id2 = df.uniqueId();
            expect(id1).not.toBe(id2);
        });

    });


    describe("4. pub/sub pattern", function () {

        it("implements Publisher, Subscriber, Subscription", function () {
            var publisher = new df.Publisher();
            var log = jasmine.createSpy();
            var subscription = new df.Subscription({
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

    });


});