var df = require("dataflower"),
    Base = df.Base,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("Base", function () {


        it("is an Object descendant", function () {

            expect(Base.prototype instanceof Object).toBe(true);
        });

        describe("static", function () {

            describe("extend", function () {

                it("calls the extend function on the class", function () {

                    var My = Base.extend({a: 1}, {b: 2});
                    var my = new My();
                    expect(My.prototype instanceof Base);
                    expect(My.prototype.a).toBe(1);
                    expect(My.b).toBe(2);
                    expect(my.id).toBeDefined();
                });

            });

            describe("mixin", function () {

                it("calls the mixin function on the class", function () {

                    var My = Base.extend();
                    My.mixin({a: 1});
                    expect(My.a).toBe(1);

                });

            });

            describe("clone", function () {

                it("accepts only Base relative instances", function () {

                    expect(function () {
                        Base.clone(new Base());
                        Base.clone(new (Base.extend()));
                    }).not.toThrow();

                    expect(function () {
                        Base.clone({});
                    }).toThrow(new InvalidArguments());

                    expect(function () {
                        Base.clone(null);
                    }).toThrow(new InvalidArguments());

                });

                it("calls clone on the instance", function () {
                    var base = new Base();
                    var o = {};
                    base.clone = jasmine.createSpy().and.callFake(function () {
                        return o;
                    });
                    expect(Base.clone(base)).toBe(o);
                    expect(base.clone).toHaveBeenCalled();
                });

            });

        });

        describe("mixin", function () {

            it("calls the mixin function on the instance", function () {

                var err = new Base();
                err.mixin({
                    a: 1
                });
                expect(err.a).toBe(1);
                expect(Base.prototype.a).toBeUndefined();
            });

        });

        describe("clone", function () {

            it("returns a cloned instance created with prototypal inheritance", function () {

                var base = new Base();
                var base2 = base.clone();
                expect(base2).not.toBe(base);
                expect(base2 instanceof Base);
                expect(base2.id).toBe(base.id);

            });

        });

    });

});