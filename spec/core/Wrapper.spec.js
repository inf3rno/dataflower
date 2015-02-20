var df = require("dataflower"),
    Wrapper = df.Wrapper,
    InvalidArguments = df.InvalidArguments,
    shallowCopy = df.shallowCopy;

describe("core", function () {

    describe("Wrapper", function () {

        describe("mixin", function () {

            it("accepts only object, null or undefined as sources", function () {

                expect(function () {
                    new Wrapper().mixin({});
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mixin();
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mixin(null);
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mixin({}, {});
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mixin("a");
                }).toThrow(new InvalidArguments());
            });


            it("accepts only an Array of Functions as preprocessors", function () {

                expect(function () {
                    new Wrapper().mixin({
                        preprocessors: []
                    });
                    new Wrapper().mixin({
                        preprocessors: [
                            function () {
                            },
                            function () {
                            }
                        ]
                    });
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mixin({
                        preprocessors: {}
                    })
                }).toThrow(new Wrapper.ArrayRequired());

                expect(function () {
                    new Wrapper().mixin({
                        preprocessors: [
                            function () {
                            },
                            {}
                        ]
                    })
                }).toThrow(new Wrapper.PreprocessorRequired());

            });

            it("accepts only a Function as done", function () {

                expect(function () {
                    new Wrapper().mixin({
                        done: function () {
                        }
                    })
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mixin({
                        done: {}
                    })
                }).toThrow(new Wrapper.FunctionRequired());

            });

            it("accepts only a Function as algorithm", function () {

                expect(function () {
                    new Wrapper().mixin({
                        algorithm: function () {
                        }
                    })
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mixin({
                        algorithm: {}
                    })
                }).toThrow(new Wrapper.AlgorithmRequired());

            });

            it("accepts only Object instance as properties", function () {

                expect(function () {
                    new Wrapper().mixin({
                        properties: {}
                    });
                    new Wrapper().mixin({
                        properties: undefined
                    });
                }).not.toThrow();


                [
                    null,
                    "string",
                    1,
                    false
                ].forEach(function (value) {
                        expect(function () {
                            new Wrapper().mixin({
                                properties: value
                            })
                        }).toThrow(new Wrapper.PropertiesRequired());
                    });

            });

            it("returns the context itself", function () {

                var o = {};
                expect(Wrapper.prototype.mixin.call(o)).toBe(o);
            });

            it("creates a new preprocessors Array if it is not an own property", function () {
                var o = {};
                Wrapper.prototype.mixin.call(o);
                expect(o.preprocessors instanceof Array).toBe(true);
                var f = function () {
                };
                o.preprocessors.push(f);
                var o2 = Object.create(o);
                Wrapper.prototype.mixin.call(o2);
                expect(o2.preprocessors instanceof Array).toBe(true);
                expect(o2.preprocessors).toEqual(o.preprocessors);
                expect(o2.preprocessors).not.toBe(o.preprocessors);
                expect(o.preprocessors.length).toBe(1);
                expect(o.preprocessors[0]).toBe(f);
            });

            it("merges pushes preprocessors if given", function () {

                var x = function () {
                    },
                    y = function () {
                    },
                    z = function () {
                    },
                    q = function () {
                    },
                    r = function () {
                    },
                    a = [
                        x
                    ],
                    b = [y, z],
                    c = [q, r],
                    o = {
                        preprocessors: a
                    };
                Wrapper.prototype.mixin.call(o, {
                    preprocessors: b
                }, {
                    preprocessors: c
                });
                expect(o.preprocessors).toBe(a);
                expect(o.preprocessors).toEqual([x, y, z, q, r]);
            });

            it("overrides done if given", function () {

                var a = function () {
                };
                var b = function () {
                };
                var o = {
                    done: a
                };
                Wrapper.prototype.mixin.call(o, {
                    done: b
                });
                expect(o.done).toBe(b);
            });

            it("overrides algorithm if given", function () {

                var a = function () {
                };
                var b = function () {
                };
                var o = {
                    algorithm: a
                };
                Wrapper.prototype.mixin.call(o, {
                    algorithm: b
                });
                expect(o.algorithm).toBe(b);
            });

            it("creates a new properties Object with Object.create if it is not an own property", function () {

                var o = {};
                Wrapper.prototype.mixin.call(o);
                expect(o.properties instanceof Object).toBe(true);
                var p = {};
                o.properties.p = p;
                var o2 = Object.create(o);
                Wrapper.prototype.mixin.call(o2);
                expect(o2.properties instanceof Object).toBe(true);
                expect(o2.properties).not.toBe(o.properties);
                expect(o.properties.p).toBe(p);
                expect(o2.properties.p).toBe(p);
            });

            it("merges properties if given", function () {
                var a = {a: 1, b: 2},
                    b = {b: 3, c: 4},
                    o = {};
                Wrapper.prototype.mixin.call(o, {
                    properties: a
                }, {
                    properties: b
                });
                expect(o.properties).not.toBe(a);
                expect(o.properties).not.toBe(b);
                expect(o.properties).toEqual({a: 1, b: 3, c: 4});
            });

        });

        describe("wrap", function () {

            it("calls the mixin on a new options Object with the Wrapper instance properties and the options", function () {

                var f = function () {
                };
                var o = {
                    preprocessors: [function () {
                    }],
                    done: function () {
                    },
                    algorithm: function () {
                        return f;
                    },
                    properties: {},
                    mixin: jasmine.createSpy().and.callFake(function (o) {
                        shallowCopy(this, o);
                    })
                };
                var a = {
                    done: function () {
                    },
                    properties: {}
                };
                var r = Wrapper.prototype.wrap.call(o, a);

                expect(o.mixin).toHaveBeenCalledWith(a);
                expect(o.mixin.calls.count()).toBe(2);
                expect(o.mixin.calls.first().args).toEqual([{
                    preprocessors: o.preprocessors,
                    done: o.done,
                    algorithm: o.algorithm,
                    properties: o.properties
                }]);
                expect(o.mixin.calls.mostRecent().args).toEqual([a]);
                expect(r).toBe(f);

            });

            it("extends the results returned by the algorithm with the properties given in options", function () {

                var wrapper = new Wrapper({
                    properties: {
                        a: 1,
                        b: 2
                    }
                });
                var fn = wrapper.wrap({
                    properties: {
                        b: 3,
                        c: 4
                    }
                });
                expect(fn.a).toBe(1);
                expect(fn.b).toBe(3);
                expect(fn.c).toBe(4);
            });

        });

        describe("algorithm", function () {

            describe("cascade", function () {

                it("applies the preprocessors on the context while using always the return value of the previous preprocessor as arguments", function () {

                    var context = {};
                    var pp1 = jasmine.createSpy().and.callFake(function (a, b, c) {
                        expect(this).toBe(context);
                        return [c, b, a];
                    });
                    var pp2 = jasmine.createSpy().and.callFake(function (c, b, a) {
                        expect(this).toBe(context);
                        return [c, a, b];
                    });

                    var wrapper = new Wrapper();
                    var fn = wrapper.wrap({
                        preprocessors: [pp1, pp2],
                        algorithm: Wrapper.algorithm.cascade
                    });

                    expect(pp1).not.toHaveBeenCalled();
                    expect(pp2).not.toHaveBeenCalled();
                    fn.call(context, 1, 2, 3);
                    expect(pp1).toHaveBeenCalledWith(1, 2, 3);
                    expect(pp2).toHaveBeenCalledWith(3, 2, 1);
                });

                it("applies done on the context with the arguments when no preprocessor defined", function () {

                    var context = {};
                    var done = jasmine.createSpy().and.callFake(function (a, b, c) {
                        expect(this).toBe(context);
                        return [c, b, a];
                    });

                    var wrapper = new Wrapper();
                    var fn = wrapper.wrap({
                        done: done,
                        algorithm: Wrapper.algorithm.cascade
                    });

                    expect(done).not.toHaveBeenCalled();
                    expect(fn.call(context, 1, 2, 3)).toEqual([3, 2, 1]);
                    expect(done).toHaveBeenCalledWith(1, 2, 3);
                });

                it("applies done on the context with the return value of the last preprocessor as arguments", function () {

                    var pp1 = jasmine.createSpy().and.callFake(function (a, b, c) {
                        return [c, b, a];
                    });
                    var pp2 = jasmine.createSpy().and.callFake(function (c, b, a) {
                        return [c, a, b];
                    });
                    var done = jasmine.createSpy();
                    var wrapper = new Wrapper();
                    var fn = wrapper.wrap({
                        preprocessors: [pp1, pp2],
                        done: done,
                        algorithm: Wrapper.algorithm.cascade
                    });

                    expect(pp1).not.toHaveBeenCalled();
                    expect(pp2).not.toHaveBeenCalled();
                    expect(done).not.toHaveBeenCalled();
                    fn(1, 2, 3);
                    expect(pp1).toHaveBeenCalledWith(1, 2, 3);
                    expect(pp2).toHaveBeenCalledWith(3, 2, 1);
                    expect(done).toHaveBeenCalledWith(3, 1, 2);
                });

            });

            describe("firstMatch", function () {

                it("applies done on the context with the arguments when no preprocessor defined", function () {

                    var context = {};
                    var done = jasmine.createSpy().and.callFake(function (a, b, c) {
                        expect(this).toBe(context);
                        return [c, b, a];
                    });

                    var wrapper = new Wrapper();
                    var fn = wrapper.wrap({
                        done: done,
                        algorithm: Wrapper.algorithm.firstMatch
                    });

                    expect(done).not.toHaveBeenCalled();
                    expect(fn.call(context, 1, 2, 3)).toEqual([3, 2, 1]);
                    expect(done).toHaveBeenCalledWith(1, 2, 3);
                });

                it("applies done on the context with the return value of the first matching preprocessor", function () {

                    var pp1 = jasmine.createSpy();
                    var pp2 = jasmine.createSpy().and.callFake(function (a, b, c) {
                        return [c, b, a];
                    });
                    var pp3 = jasmine.createSpy();
                    var done = jasmine.createSpy();
                    var wrapper = new Wrapper();
                    var fn = wrapper.wrap({
                        preprocessors: [pp1, pp2, pp3],
                        done: done,
                        algorithm: Wrapper.algorithm.firstMatch
                    });

                    expect(pp1).not.toHaveBeenCalled();
                    expect(pp2).not.toHaveBeenCalled();
                    expect(pp3).not.toHaveBeenCalled();
                    expect(done).not.toHaveBeenCalled();
                    fn(1, 2, 3);
                    expect(pp1).toHaveBeenCalledWith(1, 2, 3);
                    expect(pp2).toHaveBeenCalledWith(1, 2, 3);
                    expect(pp3).not.toHaveBeenCalled();
                    expect(done).toHaveBeenCalledWith(3, 2, 1);
                });

            });

            describe("firstMatchCascade", function () {

                it("applies done on the context with the arguments when no preprocessor defined", function () {

                    var context = {};
                    var done = jasmine.createSpy().and.callFake(function (a, b, c) {
                        expect(this).toBe(context);
                        return [c, b, a];
                    });

                    var wrapper = new Wrapper();
                    var fn = wrapper.wrap({
                        done: done,
                        algorithm: Wrapper.algorithm.firstMatch
                    });

                    expect(done).not.toHaveBeenCalled();
                    expect(fn.call(context, 1, 2, 3)).toEqual([3, 2, 1]);
                    expect(done).toHaveBeenCalledWith(1, 2, 3);
                });

                it("applies done on the context with the return value of the first matching preprocessor called in cascade until no match", function () {

                    var pp1 = jasmine.createSpy().and.callFake(function (a) {
                        if (a == 1)
                            return [2];
                    });
                    var pp2 = jasmine.createSpy().and.callFake(function (a) {
                        if (a == 3)
                            return [4];
                    });
                    var pp3 = jasmine.createSpy().and.callFake(function (a) {
                        if (a == 2)
                            return [3];
                    });
                    var done = jasmine.createSpy();
                    var wrapper = new Wrapper();
                    var fn = wrapper.wrap({
                        preprocessors: [pp1, pp2, pp3],
                        done: done,
                        algorithm: Wrapper.algorithm.firstMatchCascade
                    });

                    expect(pp1).not.toHaveBeenCalled();
                    expect(pp2).not.toHaveBeenCalled();
                    expect(pp3).not.toHaveBeenCalled();
                    expect(done).not.toHaveBeenCalled();
                    fn(1);
                    expect(pp1.calls.count()).toBe(4);
                    expect(pp1).toHaveBeenCalledWith(1);
                    expect(pp1).toHaveBeenCalledWith(2);
                    expect(pp1).toHaveBeenCalledWith(3);
                    expect(pp1).toHaveBeenCalledWith(4);
                    expect(pp2.calls.count()).toBe(3);
                    expect(pp2).toHaveBeenCalledWith(2);
                    expect(pp2).toHaveBeenCalledWith(3);
                    expect(pp2).toHaveBeenCalledWith(4);
                    expect(pp3.calls.count()).toBe(2);
                    expect(pp3).toHaveBeenCalledWith(2);
                    expect(pp3).toHaveBeenCalledWith(4);
                    expect(done.calls.count()).toBe(1);
                    expect(done).toHaveBeenCalledWith(4);
                });

            });

        });

    });
});