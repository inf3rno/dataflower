var df = require("dflo2");

describe("example", function () {

    describe("1. inheritance, instantiation, configuration, cloning and unique id", function () {

        it("implements inheritance, instantiation, configuration, cloning", function () {
            var log = jasmine.createSpy(),
                Cat = df.Object.extend({
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
                }),
                kitty = new Cat("Kitty"),
                killer = Cat.instance("Killer");

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
            var id1 = df.id(),
                id2 = df.id();
            expect(id1).not.toBe(id2);
        });

    });

});