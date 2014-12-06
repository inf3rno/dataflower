var df = require("../df"),
    Class = df.Class;

describe("df", function () {

    describe("Class", function () {

        describe("extend(Object properties = null)", function () {

            it("does not keep the abstract init if it is overridden", function () {
                var Descendant = Class.extend({
                    init: function () {
                    }
                });
                expect(function () {
                    new Descendant();
                }).not.toThrow();
            });

            it("calls the init of the descendant if it is overridden", function () {
                var mockInit = jasmine.createSpy();
                var Descendant = Class.extend({
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
                var Descendant = Class
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
                var Descendant = Class.extend(properties);
                expect(Descendant.prototype).not.toBe(properties);
                for (var property in properties)
                    expect(Descendant.prototype[property]).toBe(properties[property]);
            });

            it("uses prototypal inheritance, so by the instances the instanceOf works on both of the ancestor and descendant", function () {

                var Ancestor = Class.extend({
                    init: function () {
                    }
                });
                var Descendant = Ancestor.extend();
                var instance = new Descendant();

                expect(instance instanceof Class).toBe(true);
                expect(instance instanceof Ancestor).toBe(true);
                expect(instance instanceof Descendant).toBe(true);
            });

            it('lib should be instantiated for each matching element', function () {
                var mockClass = function (Subject) {
                    var Surrogate = function () {
                        Surrogate.prototype.constructor.apply(this, arguments);
                    };
                    Surrogate.prototype = Object.create(Subject.prototype);
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

        });

    });

});