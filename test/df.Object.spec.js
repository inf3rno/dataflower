var NativeObject = Object,
    df = require("../df");

describe("df", function () {

    var Object = df.Object;

    describe("Object", function () {

        describe("instance(p1, p2, ...)", function () {

            it("should create a new instance of the Object", function () {
                var instance = Object.instance();
                expect(instance instanceof Object).toBe(true);
            });

        });

        describe("extend(Object properties = null)", function () {

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
                expect(mockInit.callCount).toBe(2);
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
                spyOn(Mock.prototype, "constructor").andCallThrough();
                spyOn(Mock.prototype, "init");

                var m = new Mock(1);

                expect(Mock.prototype.init).toBe(m.init);
                expect(My.prototype.init).not.toBe(m.init);
                expect(m.constructor).toHaveBeenCalledWith(1);
                expect(m.init).toHaveBeenCalledWith(1);
                expect(m.a).toBeUndefined();
                m.setA(1);
                expect(m.a).toBe(1);

                spyOn(Mock.prototype, "setA").andCallFake(function (a) {
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
                    a: {},
                    b: {}
                };
                var object = Object.instance();
                object.configure(options);
                expect(object.a).toBe(options.a);
                expect(object.b).toBe(options.b);
            });

        });

    });

});