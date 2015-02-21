var df = require("dataflower"),
    id = df.id,
    extend = df.extend,
    clone = df.clone,
    mixin = df.mixin,
    shallowCopy = df.shallowCopy,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("id", function () {

        it("returns unique id", function () {
            var store = {};
            for (var i = 0; i < 10; ++i) {
                var current = id();
                if (current in store)
                    break;
                store[current] = true;
            }
            expect(i).toBe(10);
        });

    });

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

            it("sets unique id automatically", function () {

                var Ancestor = function () {
                };
                var Descendant = extend(Ancestor);
                expect(Descendant.prototype.id).toBeUndefined();
                var descendant = new Descendant();
                expect(descendant.id).toBeDefined();
                expect(descendant.id).not.toBe(new Descendant().id);
            });

            it("calls init before mixin if a function is set", function () {

                var Ancestor = function () {
                };
                var Descendant = extend(Ancestor, {
                    prepare: jasmine.createSpy()
                });
                var descendant = new Descendant({}, {}, {});
                expect(descendant.prepare).toHaveBeenCalledWith();
            });

            it("calls mixin from the prototype after unique id is set", function () {

                var Ancestor = function () {
                };
                var Descendant = extend(Ancestor, {
                    mixin: jasmine.createSpy()
                });
                var descendant = new Descendant(1, 2, 3);
                expect(descendant.mixin).toHaveBeenCalledWith(1, 2, 3);
            });

            it("calls init after mixin if a function is set", function () {

                var Ancestor = function () {
                };
                var Descendant = extend(Ancestor, {
                    init: jasmine.createSpy()
                });
                var descendant = new Descendant({}, {}, {});
                expect(descendant.init).toHaveBeenCalledWith();
            });

        });

    });

    describe("clone", function () {

        it("returns the same primitives and Function", function () {
            [
                undefined,
                null,
                "string",
                123,
                true,
                false,
                function () {
                }
            ].forEach(function (value) {
                    expect(clone(value)).toBe(value);
                });
        });

        it("returns a different Array with the same values", function () {

            var a = [{}, 1, 2, 3];
            var b = clone(a);
            expect(b).toEqual(a);
            expect(b).not.toBe(a);
            expect(b[0]).toBe(a[0]);
        });

        it("returns a different Date with the same time", function () {

            var a = new Date();
            var b = clone(a);
            expect(b instanceof Date);
            expect(b).not.toBe(a);
            expect(b.toString()).toBe(a.toString());
        });

        it("returns a different RegExp with the same pattern and flags", function () {

            var a = /\w/gm;
            var b = clone(a);
            expect(b instanceof RegExp);
            expect(b).not.toBe(a);
            expect(b.toString()).toBe(a.toString());
        });

        it("returns a descendant Object created with Object.create", function () {

            var a = {x: {}, y: 1};
            var b = clone(a);
            expect(b).not.toBe(a);
            expect(b.x).toBe(a.x);
            a.y = 2;
            expect(b.y).toBe(a.y);
            b.y = 3;
            expect(b.y).not.toBe(a.y);
        });

        it("calls clone if the Object has such a method", function () {

            var a = {
                clone: function () {
                    return b;
                }
            };
            var b = {};
            expect(clone(a)).toBe(b);
        });

    });


    describe("mixin", function () {

        it("calls the mixin function of the subject with the arguments", function () {

            var o = {};
            var subject = {
                mixin: jasmine.createSpy().and.callFake(function () {
                    return o;
                })
            };
            expect(mixin(subject, 1, 2, 3)).toBe(o);
            expect(subject.mixin).toHaveBeenCalledWith(1, 2, 3);
        });

        it("calls shallowCopy if no mixin function set", function () {

            var subject = {};
            expect(mixin(subject, {a: 1}, {b: 2}, {a: 3, c: 4})).toBe(subject);
            expect(subject).toEqual({b: 2, a: 3, c: 4});
        });

    });


    describe("shallowCopy", function () {

        it("accepts any type of object as subject and sources", function () {

            expect(function () {
                shallowCopy({});
                shallowCopy({}, {});
                shallowCopy({}, {}, {});
                shallowCopy(function () {
                }, function () {
                }, function () {
                });
                shallowCopy(new Date(), new RegExp(), function () {
                }, []);
                shallowCopy({}, null);
                shallowCopy({}, undefined);
            }).not.toThrow();

            expect(function () {
                shallowCopy({}, 1, 2, 3);
            }).toThrow(new df.InvalidArguments());

            expect(function () {
                shallowCopy(null);
            }).toThrow(new df.InvalidArguments());

            expect(function () {
                shallowCopy(null, {});
            }).toThrow(new df.InvalidArguments());

            expect(function () {
                shallowCopy(1, {});
            }).toThrow(new df.InvalidArguments());

            expect(function () {
                shallowCopy({}, false);
            }).toThrow(new df.InvalidArguments());
        });

        it("overrides properties of the subject with the properties of the sources", function () {

            var subject = {};
            shallowCopy(subject, {a: 1}, {b: 2}, {a: 3, c: 4});
            expect(subject).toEqual({b: 2, a: 3, c: 4});
        });

        it("overrides native methods of the subject with the ones defined in the sources", function () {
            var subject = {};
            var toString = function () {
                return "";
            };
            shallowCopy(subject, {toString: toString});
            expect(subject.toString).toBe(toString);
        });

        it("returns the subject", function () {

            var subject = {};
            expect(shallowCopy(subject)).toBe(subject);
            expect(shallowCopy(subject, {a: 1}, {b: 2})).toBe(subject);
        });

    });


});
