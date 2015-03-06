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

        describe("merge", function () {

            it("calls the merge function on the class", function () {

                var My = Base.extend();
                My.merge({a: 1});
                expect(My.a).toBe(1);

            });

        });

        describe("prototpye", function () {

            describe("merge", function () {

                it("calls the shallowCopy function on the instance", function () {

                    var err = new Base();
                    err.merge({
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

                it("calls build on the cloned instance if a Function given", function () {

                    var a = {
                        build: jasmine.createSpy()
                    };
                    var b = Base.prototype.clone.call(a);
                    expect(a.build).toHaveBeenCalled();
                    expect(a.build.calls.first().object).toBe(b);
                });

            });

            describe("init", function () {

                it("is called by instantiation", function () {

                    var Descendant = Base.extend({
                        init: jasmine.createSpy()
                    });
                    var descendant = new Descendant(1, 2, 3);
                    expect(descendant.init).toHaveBeenCalledWith(1, 2, 3);
                });

                it("sets unique id automatically", function () {

                    var base = new Base();
                    expect(base.id).toBeDefined();
                    expect(base.id).not.toBe(new Base().id);
                });

                it("calls build, merge, configure in this order", function () {

                    var log = jasmine.createSpy();
                    var Descendant = Base.extend({
                        build: function () {
                            expect(this.id).toBeDefined();
                            log("build", this, Array.prototype.slice.call(arguments));
                        },
                        merge: function (a, b) {
                            log("merge", this, Array.prototype.slice.call(arguments));
                        },
                        configure: function () {
                            log("configure", this, Array.prototype.slice.call(arguments));
                        }
                    });
                    var descendant = new Descendant({a: 1}, {b: 2});
                    expect(log.calls.argsFor(0)).toEqual(["build", descendant, []]);
                    expect(log.calls.argsFor(1)).toEqual(["merge", descendant, [{a: 1}, {b: 2}]]);
                    expect(log.calls.argsFor(2)).toEqual(["configure", descendant, []]);
                    expect(log.calls.count()).toBe(3);
                });

            });

        });

    });

});