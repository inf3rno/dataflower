var NativeObject = Object,
    NativeError = Error,
    df = require("../df");

describe("df", function () {

    var Object = df.Object;
    var InvalidArguments = df.InvalidArguments;

    describe("Object", function () {

        describe("instance", function () {

            it("creates a new instance of the Object", function () {
                var instance = Object.instance();
                expect(instance instanceof Object).toBe(true);
            });

            it("creates Descendant instances by inheritation", function () {

                var log = jasmine.createSpy();
                var Descendant = Object.extend({
                    init: log
                });
                expect(log).not.toHaveBeenCalled();
                var instance = Descendant.instance(1, 2, 3);
                expect(log).toHaveBeenCalledWith(1, 2, 3);
                expect(instance instanceof Descendant).toBe(true);
            });

        });

        describe("clone", function () {

            it("should clone the given instance of the Object with shallow copy", function () {

                var instance = Object.instance({
                    a: 1,
                    b: {}
                });
                var clone = Object.clone(instance);

                expect(clone).not.toBe(instance);
                expect(clone.a).toEqual(instance.a);
                expect(clone.b).toBe(instance.b);

                var clone2 = Object.clone(instance);
                expect(clone2).not.toBe(clone);
            });


            it("should clone the given instance with prototypal inheritance", function () {

                var instance = Object.instance({
                    a: 1,
                    b: {}
                });
                var clone = Object.clone(instance);
                var clone2 = Object.clone(instance);

                instance.c = {};
                expect(instance.c).toBeDefined();
                expect(clone.c).toBe(instance.c);
                expect(clone2.c).toBe(instance.c);

                clone.d = {};
                expect(clone.d).toBeDefined();
                expect(instance.d).toBeUndefined();
                expect(clone2.d).toBeUndefined();
            });

            it("should clone native objects as well", function () {

                var instance = {
                    a: 1,
                    b: {}
                };
                var clone = Object.clone(instance);
                expect(clone).not.toBe(instance);
                expect(clone.a).toEqual(instance.a);
                expect(clone.b).toBe(instance.b);

            });

            it("should clone descendants based on their custom cloning methods", function () {

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
                });
                var instance = new Descendant();

                var compare = function (clone, instance) {
                    expect(clone).not.toBe(instance);
                    expect(clone instanceof Descendant).toBe(true);
                    expect(clone.x).toBe(instance.x);
                    expect(clone.o).not.toBe(instance.o);
                    expect(clone.o.a).toEqual(instance.o.a);
                    expect(clone.o.b).toBe(instance.o.b);
                };

                var clone = Object.clone(instance);
                var clone2 = Descendant.clone(instance);

                compare(clone, instance);
                compare(clone2, instance);

            });

        });

        describe("extend", function () {

            it("does not keep the abstract init if it is overridden", function () {
                var Descendant = Object.extend({
                    init: function () {
                    }
                });
                expect(function () {
                    new Descendant();
                }).not.toThrow();
            });

            it("calls the init of the descendant if it is overridden", function () {
                var mockInit = jasmine.createSpy();
                var Descendant = Object.extend({
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
                };
                var Descendant = Object
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

            it("overrides properties in the prototype if they are given", function () {
                var properties = {
                    a: 1,
                    b: "b",
                    c: {}
                };
                var Descendant = Object.extend(properties);
                expect(Descendant.prototype).not.toBe(properties);
                for (var property in properties)
                    expect(Descendant.prototype[property]).toBe(properties[property]);
            });

            it("uses prototypal inheritance, so by the instances the instanceOf works on both of the ancestor and descendant", function () {
                var Ancestor = Object.extend({
                    init: function () {
                    }
                });
                var Descendant = Ancestor.extend();
                var instance = new Descendant();

                expect(instance instanceof Object).toBe(true);
                expect(instance instanceof Ancestor).toBe(true);
                expect(instance instanceof Descendant).toBe(true);
            });

            it("should not override the ancestor by changes of the descendant or any instance", function () {
                var mockClass = function (Subject) {
                    var Surrogate = function () {
                        Surrogate.prototype.constructor.apply(this, arguments);
                    };
                    Surrogate.prototype = NativeObject.create(Subject.prototype);
                    Surrogate.prototype.constructor = Subject;
                    return Surrogate;
                };

                var My = function (a) {
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

            it("should inherit static properties to the descendant", function () {
                var My = Object.extend();
                expect(My.extend).toBe(Object.extend);
                expect(My.instance).toBe(Object.instance);
            });

            it("should override static properties of the descendant when new static properties given", function () {
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
                };
                var object = Object.instance();
                object.configure(options);
                expect(object.property).toBe(options.property);
                expect(object.method).toBe(options.method);
                expect(object.method).not.toHaveBeenCalled();
                object.method(13);
                expect(object.method).toHaveBeenCalledWith(13);
            });

            it("calls init when it was redefined", function () {

                var options = {
                    init: jasmine.createSpy(),
                    method: jasmine.createSpy()
                };
                var object = Object.instance();
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