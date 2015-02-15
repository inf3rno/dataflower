var df = require("dataflower"),
    Base = df.Base,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("Base", function () {

        describe("instance", function () {

            it("creates a new instance of the Base", function () {
                var instance = Base.instance();
                expect(instance instanceof Base).toBe(true);
            });

            it("creates Descendant instances by inheritation", function () {

                var log = jasmine.createSpy(),
                    Descendant = Base.extend({
                        init: log
                    });
                expect(log).not.toHaveBeenCalled();
                var instance = Descendant.instance(1, 2, 3);
                expect(log).toHaveBeenCalledWith(1, 2, 3);
                expect(instance instanceof Descendant).toBe(true);
            });

        });

        describe("clone", function () {

            it("clones the given instance of the Base with shallow copy", function () {

                var instance = Base.instance({
                        a: 1,
                        b: {}
                    }),
                    clone = Base.clone(instance);

                expect(clone).not.toBe(instance);
                expect(clone.a).toEqual(instance.a);
                expect(clone.b).toBe(instance.b);

                var clone2 = Base.clone(instance);
                expect(clone2).not.toBe(clone);
            });


            it("clones the given instance with prototypal inheritance", function () {

                var instance = Base.instance({
                        a: 1,
                        b: {}
                    }),
                    clone = Base.clone(instance),
                    clone2 = Base.clone(instance);

                instance.c = {};
                expect(instance.c).toBeDefined();
                expect(clone.c).toBe(instance.c);
                expect(clone2.c).toBe(instance.c);

                clone.d = {};
                expect(clone.d).toBeDefined();
                expect(instance.d).toBeUndefined();
                expect(clone2.d).toBeUndefined();
            });

            it("clones native objects as well", function () {

                var instance = {
                        a: 1,
                        b: {}
                    },
                    clone = Base.clone(instance);
                expect(clone).not.toBe(instance);
                expect(clone.a).toEqual(instance.a);
                expect(clone.b).toBe(instance.b);

            });

            it("clones descendants based on their custom cloning methods", function () {

                var Descendant = Base.extend({
                        x: undefined,
                        o: undefined,
                        init: function () {
                            this.x = {};
                            this.o = {
                                a: 1,
                                b: {}
                            };
                        }
                    }, {
                        clone: function (instance) {
                            if (!(instance instanceof Descendant))
                                throw new InvalidArguments("Invalid instance type");
                            var clone = Object.create(instance);
                            clone.o = Base.clone(clone.o);
                            return clone;
                        }
                    }),
                    instance = new Descendant(),
                    compare = function (clone, instance) {
                        expect(clone).not.toBe(instance);
                        expect(clone instanceof Descendant).toBe(true);
                        expect(clone.x).toBe(instance.x);
                        expect(clone.o).not.toBe(instance.o);
                        expect(clone.o.a).toEqual(instance.o.a);
                        expect(clone.o.b).toBe(instance.o.b);
                    },
                    clone = Base.clone(instance),
                    clone2 = Descendant.clone(instance);

                compare(clone, instance);
                compare(clone2, instance);

            });

        });

        describe("extend", function () {

            it("calls the init of the descendant", function () {
                var mockInit = jasmine.createSpy(),
                    Descendant = Base.extend({
                        init: mockInit
                    });
                new Descendant();
                expect(mockInit).toHaveBeenCalled();
                new Descendant();
                expect(mockInit.calls.count()).toBe(2);
            });

            it("does not call the init of an ancestor automatically", function () {
                var mockInits = {
                        ancestor: jasmine.createSpy(),
                        descendant: jasmine.createSpy()
                    },
                    Descendant = Base
                        .extend({
                            init: mockInits.ancestor
                        })
                        .extend({
                            init: mockInits.descendant
                        });
                new Descendant(1, 2, 3);
                expect(mockInits.ancestor).not.toHaveBeenCalled();
                expect(mockInits.descendant).toHaveBeenCalledWith(1, 2, 3);
                new Descendant(4, 5, 6);
                expect(mockInits.descendant).toHaveBeenCalledWith(4, 5, 6);
            });

            it("overrides properties in the prototype with given ones", function () {
                var properties = {
                        a: 1,
                        b: "b",
                        c: {}
                    },
                    Descendant = Base.extend(properties);
                expect(Descendant.prototype).not.toBe(properties);
                for (var property in properties)
                    expect(Descendant.prototype[property]).toBe(properties[property]);
            });

            it("overrides native methods like toString, in the prototype with the given ones", function () {

                var log = jasmine.createSpy().and.callFake(function () {
                        return "";
                    }),
                    Descendant = Base.extend({
                        toString: log
                    });
                String(Descendant.prototype);
                expect(log).toHaveBeenCalled();
            });

            it("uses prototypal inheritance, so by the instances the instanceOf works on both of the ancestor and descendant", function () {
                var Ancestor = Base.extend({
                        init: function () {
                        }
                    }),
                    Descendant = Ancestor.extend(),
                    instance = new Descendant();

                expect(instance instanceof Base).toBe(true);
                expect(instance instanceof Ancestor).toBe(true);
                expect(instance instanceof Descendant).toBe(true);
            });

            it("does not override the ancestor by changes of the descendant or any instance", function () {
                var mockClass = function (Subject) {
                        var Surrogate = function () {
                            Surrogate.prototype.constructor.apply(this, arguments);
                        };
                        Surrogate.prototype = Object.create(Subject.prototype);
                        Surrogate.prototype.constructor = Subject;
                        return Surrogate;
                    },
                    My = function (a) {
                        this.init(a);
                    };
                My.prototype = {
                    init: function (a) {
                        this.setA(a);
                    },
                    setA: function (a) {
                        this.a = a;
                    }
                };

                var Mock = mockClass(My);
                spyOn(Mock.prototype, "constructor").and.callThrough();
                spyOn(Mock.prototype, "init");

                var m = new Mock(1);

                expect(Mock.prototype.init).toBe(m.init);
                expect(My.prototype.init).not.toBe(m.init);
                expect(m.constructor).toHaveBeenCalledWith(1);
                expect(m.init).toHaveBeenCalledWith(1);
                expect(m.a).toBeUndefined();
                m.setA(1);
                expect(m.a).toBe(1);

                spyOn(Mock.prototype, "setA").and.callFake(function (a) {
                    this.a = a + 1;
                });
                m.setA(1);
                expect(m.setA).toHaveBeenCalledWith(1);
                expect(m.a).toBe(2);
            });

            it("inherits static properties to the descendant", function () {
                var My = Base.extend();
                expect(My.extend).toBe(Base.extend);
                expect(My.instance).toBe(Base.instance);
            });

            it("overrides static properties of the descendant when new static properties given", function () {
                var My = Base.extend(null, {
                    instance: function () {
                    },
                    anotherMethod: function () {
                    }
                });
                expect(My.extend).toBe(Base.extend);
                expect(My.instance).not.toBe(Base.instance);
                expect(My.anotherMethod).toBeDefined();
            });

        });

        describe("configure", function () {

            it("overrides instance properties with the given ones", function () {
                var options = {
                        property: {},
                        method: jasmine.createSpy()
                    },
                    object = Base.instance();
                object.configure(options);
                expect(object.property).toBe(options.property);
                expect(object.method).toBe(options.method);
                expect(object.method).not.toHaveBeenCalled();
                object.method(13);
                expect(object.method).toHaveBeenCalledWith(13);
            });

            it("overrides native methods like toString with the given ones", function () {
                var object = Base.instance(),
                    log = jasmine.createSpy().and.callFake(function () {
                        return "";
                    });
                object.configure({
                    toString: log
                });
                String(object);
                expect(log).toHaveBeenCalled();
            });

            it("calls init when it was redefined", function () {
                var options = {
                        init: jasmine.createSpy(),
                        method: jasmine.createSpy()
                    },
                    object = Base.instance();
                object.configure(options, {init: [13, 14]});
                expect(object.init).toBe(options.init);
                expect(options.init).toHaveBeenCalledWith(13, 14);
                expect(options.method).not.toHaveBeenCalled();
                object.configure(options, {init: [15, 16]});
                expect(options.init).toHaveBeenCalledWith(15, 16);
            });

            it("transforms parameters with preprocessor functions", function () {

                var object = Base.instance();
                object.configure({
                    a: 1,
                    b: 2
                }, {
                    b: function (b) {
                        return b + 3
                    }
                });
                expect(object.a).toBe(1);
                expect(object.b).toBe(5);
            });

            it("accepts only function as preprocessor except init ofc.", function () {

                var object = Base.instance();
                expect(function () {
                    object.configure({a: 1}, {a: 2});
                }).toThrow(new Base.FunctionRequired());

            });

            it("overrides old configure with the new one, and calls only the new one", function () {

                var object = Base.instance(),
                    options = {
                        configure: jasmine.createSpy(),
                        a: 1
                    },
                    preprocessor = {
                        a: jasmine.createSpy()
                    };
                object.configure(options, preprocessor);
                expect(preprocessor.a).not.toHaveBeenCalled();
                expect(options.configure).toHaveBeenCalledWith(options, preprocessor);
            });

        });

        describe("isOptions", function () {

            it("returns true only by native objects.", function () {
                var o = Base.instance();

                expect(o.isOptions(null)).toBe(false);
                expect(o.isOptions(false)).toBe(false);
                expect(o.isOptions(o)).toBe(false);
                expect(o.isOptions(undefined)).toBe(false);
                expect(o.isOptions(new Date())).toBe(false);
                expect(o.isOptions([1, 2, 3])).toBe(false);
                expect(o.isOptions(new Error())).toBe(false);
                expect(o.isOptions(function () {
                })).toBe(false);

                expect(o.isOptions({})).toBe(true);
                expect(o.isOptions(new Object())).toBe(true);
            });

        });

    });

});