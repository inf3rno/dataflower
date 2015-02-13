var NativeObject = Object,
    NativeError = Error,
    df = require("dflo2");

describe("df", function () {

    var Object = df.Object,
        InvalidArguments = df.InvalidArguments;

    describe("Object", function () {

        describe("instance", function () {

            it("creates a new instance of the Object", function () {
                var instance = Object.instance();
                expect(instance instanceof Object).toBe(true);
            });

            it("creates Descendant instances by inheritation", function () {

                var log = jasmine.createSpy(),
                    Descendant = Object.extend({
                        init: log
                    });
                expect(log).not.toHaveBeenCalled();
                var instance = Descendant.instance(1, 2, 3);
                expect(log).toHaveBeenCalledWith(1, 2, 3);
                expect(instance instanceof Descendant).toBe(true);
            });

        });

        describe("clone", function () {

            it("clones the given instance of the Object with shallow copy", function () {

                var instance = Object.instance({
                        a: 1,
                        b: {}
                    }),
                    clone = Object.clone(instance);

                expect(clone).not.toBe(instance);
                expect(clone.a).toEqual(instance.a);
                expect(clone.b).toBe(instance.b);

                var clone2 = Object.clone(instance);
                expect(clone2).not.toBe(clone);
            });


            it("clones the given instance with prototypal inheritance", function () {

                var instance = Object.instance({
                        a: 1,
                        b: {}
                    }),
                    clone = Object.clone(instance),
                    clone2 = Object.clone(instance);

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
                    clone = Object.clone(instance);
                expect(clone).not.toBe(instance);
                expect(clone.a).toEqual(instance.a);
                expect(clone.b).toBe(instance.b);

            });

            it("clones descendants based on their custom cloning methods", function () {

                var Descendant = Object.extend({
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
                            var clone = NativeObject.create(instance);
                            clone.o = Object.clone(clone.o);
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
                    clone = Object.clone(instance),
                    clone2 = Descendant.clone(instance);

                compare(clone, instance);
                compare(clone2, instance);

            });

        });

        describe("extend", function () {

            it("calls the init of the descendant", function () {
                var mockInit = jasmine.createSpy(),
                    Descendant = Object.extend({
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
                    Descendant = Object
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
                    Descendant = Object.extend(properties);
                expect(Descendant.prototype).not.toBe(properties);
                for (var property in properties)
                    expect(Descendant.prototype[property]).toBe(properties[property]);
            });

            it("overrides native methods like toString, in the prototype with the given ones", function () {

                var log = jasmine.createSpy().and.callFake(function () {
                        return "";
                    }),
                    Descendant = Object.extend({
                        toString: log
                    });
                String(Descendant.prototype);
                expect(log).toHaveBeenCalled();
            });

            it("uses prototypal inheritance, so by the instances the instanceOf works on both of the ancestor and descendant", function () {
                var Ancestor = Object.extend({
                        init: function () {
                        }
                    }),
                    Descendant = Ancestor.extend(),
                    instance = new Descendant();

                expect(instance instanceof Object).toBe(true);
                expect(instance instanceof Ancestor).toBe(true);
                expect(instance instanceof Descendant).toBe(true);
            });

            it("does not override the ancestor by changes of the descendant or any instance", function () {
                var mockClass = function (Subject) {
                        var Surrogate = function () {
                            Surrogate.prototype.constructor.apply(this, arguments);
                        };
                        Surrogate.prototype = NativeObject.create(Subject.prototype);
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
                var My = Object.extend();
                expect(My.extend).toBe(Object.extend);
                expect(My.instance).toBe(Object.instance);
            });

            it("overrides static properties of the descendant when new static properties given", function () {
                var My = Object.extend(null, {
                    instance: function () {
                    },
                    anotherMethod: function () {
                    }
                });
                expect(My.extend).toBe(Object.extend);
                expect(My.instance).not.toBe(Object.instance);
                expect(My.anotherMethod).toBeDefined();
            });

        });

        describe("configure", function () {

            it("overrides instance properties with the given ones", function () {
                var options = {
                        property: {},
                        method: jasmine.createSpy()
                    },
                    object = Object.instance();
                object.configure(options);
                expect(object.property).toBe(options.property);
                expect(object.method).toBe(options.method);
                expect(object.method).not.toHaveBeenCalled();
                object.method(13);
                expect(object.method).toHaveBeenCalledWith(13);
            });

            it("overrides native methods like toString with the given ones", function () {
                var object = Object.instance(),
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
                    object = Object.instance();
                object.configure(options, [13, 14]);
                expect(options.init).toHaveBeenCalledWith(13, 14);
                expect(options.method).not.toHaveBeenCalled();
                object.configure(options, 15, 16);
                expect(options.init).toHaveBeenCalledWith(15, 16);
            });

        });

        describe("isOptions", function () {

            it("returns true only by native objects.", function () {
                var o = Object.instance();

                expect(o.isOptions(null)).toBe(false);
                expect(o.isOptions(false)).toBe(false);
                expect(o.isOptions(o)).toBe(false);
                expect(o.isOptions(undefined)).toBe(false);
                expect(o.isOptions(new Date())).toBe(false);
                expect(o.isOptions([1, 2, 3])).toBe(false);
                expect(o.isOptions(new NativeError())).toBe(false);
                expect(o.isOptions(function () {
                })).toBe(false);

                expect(o.isOptions({})).toBe(true);
                expect(o.isOptions(new NativeObject())).toBe(true);
            });

        });

    });

});