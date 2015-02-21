var df = require("dataflower"),
    Base = df.Base,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("Base", function () {


        it("is an Object descendant", function () {

            expect(Base.prototype instanceof Object).toBe(true);
        });

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

        describe("prototpye", function () {

            describe("mixin", function () {

                it("calls the shallowCopy function on the instance", function () {

                    var err = new Base();
                    err.mixin({
                        a: 1
                    });
                    expect(err.a).toBe(1);
                    expect(Base.prototype.a).toBeUndefined();
                });

            });

            describe("clone", function () {

                it("calls Object.create() on the instance", function () {

                    var a = {x: {}, y: 1};
                    var b = Base.prototype.clone.call(a);
                    expect(b).not.toBe(a);
                    expect(b.x).toBe(a.x);
                    a.y = 2;
                    expect(b.y).toBe(a.y);
                    b.y = 3;
                    expect(b.y).not.toBe(a.y);
                });

                it("calls prepare on the cloned instance if a Function given", function () {

                    var a = {
                        prepare: jasmine.createSpy()
                    };
                    var b = Base.prototype.clone.call(a);
                    expect(a.prepare).toHaveBeenCalled();
                    expect(a.prepare.calls.first().object).toBe(b);
                });

            });

        });

    });

});