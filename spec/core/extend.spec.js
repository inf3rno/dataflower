var df = require("dataflower"),
    extend = df.extend,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("extend", function () {

        it("accepts constructor as ancestor and objects as property and static property sources", function () {
            expect(function () {
                extend(function () {
                });
                extend(function () {
                }, {});
                extend(function () {
                }, {}, {});
                extend(function () {
                }, null, undefined);
            }).not.toThrow();

            expect(function () {
                extend({});
            }).toThrow(new InvalidArguments());

            expect(function () {
                extend(function () {
                }, {}, {}, {});
            }).toThrow(new InvalidArguments());

            expect(function () {
                extend(function () {
                }, 1);
            }).toThrow(new InvalidArguments());

            expect(function () {
                extend(function () {
                }, null, 1);
            }).toThrow(new InvalidArguments());

        });

        it("returns the constructor of the newly created descendant", function () {

            var Ancestor = function () {
            };
            var Descendant = extend(Ancestor);
            expect(Descendant instanceof Function).toBe(true);
            expect(Ancestor).not.toBe(Descendant);

        });

        it("inherits the properties of the ancestor with prototypal inheritance to the descendant", function () {

            var Ancestor = function () {
            };
            Ancestor.prototype.x = {};
            var Descendant = extend(Ancestor);
            expect(Descendant.prototype.x).toBe(Ancestor.prototype.x);
            Ancestor.prototype.x = {};
            expect(Descendant.prototype.x).toBe(Ancestor.prototype.x);
            Descendant.prototype.x = {};
            expect(Descendant.prototype.x).not.toBe(Ancestor.prototype.x);
        });

        it("mixins the properties of the descendant with the given ones", function () {
            var Ancestor = function () {
            };
            Ancestor.prototype.x = {};
            var x = {};
            var Descendant = extend(Ancestor, {x: x});
            expect(Descendant.prototype.x).not.toBe(Ancestor.prototype.x);
            expect(Descendant.prototype.x).toBe(x);
        });

        it("mixins the static properties of the ancestor with simple copy to the descendant", function () {
            var Ancestor = function () {
            };
            Ancestor.x = {};
            var Descendant = extend(Ancestor);
            expect(Descendant.x).toBe(Ancestor.x);
            var backup = Ancestor.x;
            Ancestor.x = {};
            expect(Descendant.x).not.toBe(Ancestor.x);
            Ancestor.x = backup;
            expect(Descendant.x).toBe(Ancestor.x);
            Descendant.x = {};
            expect(Descendant.x).not.toBe(Ancestor.x);
        });

        it("mixins the static properties of the descendant with the given ones", function () {
            var Ancestor = function () {
            };
            Ancestor.x = {};
            var x = {};
            var Descendant = extend(Ancestor, null, {
                x: x
            });
            expect(Descendant.x).not.toBe(Ancestor.x);
            expect(Descendant.x).toBe(x);
        });

        describe("the constructor of the descendant", function () {

            it("calls init if set", function () {

                var Ancestor = function () {
                };
                var Descendant = extend(Ancestor, {
                    init: jasmine.createSpy()
                });
                var descendant = new Descendant(1, 2, 3);
                expect(descendant.init).toHaveBeenCalledWith(1, 2, 3);
                expect(descendant.init.calls.first().object).toBe(descendant);

            });

        });

    });

});
