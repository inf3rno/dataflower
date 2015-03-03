var df = require("dataflower");

describe("example", function () {

    describe("1. inheritance, instantiation, configuration, cloning and unique id", function () {

        it("implements inheritance, instantiation, configuration, cloning", function () {
            var log = jasmine.createSpy(),
                Cat = df.Base.extend({
                    name: undefined,
                    init: function () {
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
                kitty = new Cat({name: "Kitty"}),
                killer = new Cat({name: "Killer"});

            kitty.meow();
            expect(log).toHaveBeenCalledWith("Kitty: meow");
            expect(log).not.toHaveBeenCalledWith("Killer: meow");
            killer.meow();
            expect(log).toHaveBeenCalledWith("Killer: meow");
            expect(Cat.count()).toBe(2);

            kitty.mixin({
                init: function (postfix) {
                    this.name += " " + postfix;
                }
            });
            kitty.init("Cat");
            kitty.meow();
            expect(log).toHaveBeenCalledWith("Kitty Cat: meow");
            kitty.init("from London");
            kitty.meow();
            expect(log).toHaveBeenCalledWith("Kitty Cat from London: meow");

            var kittyClone = df.clone(kitty);
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