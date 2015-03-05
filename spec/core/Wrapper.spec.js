var df = require("dataflower"),
    Wrapper = df.Wrapper,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("Wrapper", function () {

        describe("prototype", function () {

            describe("prepare", function () {

                it("clones the preprocessors Array", function () {

                    var wrapper = new Wrapper({
                        preprocessors: [function () {
                        }]
                    });
                    var wrapper2 = Object.create(wrapper);
                    expect(wrapper2.preprocessors).toBe(wrapper.preprocessors);
                    wrapper2.prepare();
                    expect(wrapper2.preprocessors).not.toBe(wrapper.preprocessors);
                    expect(wrapper2.preprocessors).toEqual(wrapper.preprocessors);
                });

                it("clones the properties Object", function () {

                    var wrapper = new Wrapper({
                        properties: {
                            a: {}
                        }
                    });
                    var wrapper2 = Object.create(wrapper);
                    expect(wrapper2.properties).toBe(wrapper.properties);
                    wrapper2.prepare();
                    expect(wrapper2.properties).not.toBe(wrapper.properties);
                    expect(wrapper2.properties.a).toBe(wrapper.properties.a);
                });

            });

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
                    ].forEach(function (invalidProperties) {
                            expect(function () {
                                new Wrapper().mixin({
                                    properties: invalidProperties
                                })
                            }).toThrow(new Wrapper.PropertiesRequired());
                        });
                });

                it("returns the context itself", function () {

                    var o = {};
                    expect(Wrapper.prototype.mixin.call(o)).toBe(o);
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

                it("merges properties if given", function () {
                    var a = {a: 1, b: 2},
                        b = {b: 3, c: 4},
                        o = {
                            properties: {}
                        };
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

            describe("toFunction", function () {

                it("extends the results returned by the algorithm with the properties given in options", function () {

                    var log = jasmine.createSpy();
                    var wrapper = new Wrapper({
                        algorithm: function (wrapper) {
                            log(wrapper);
                            return log;
                        },
                        properties: {
                            a: 1,
                            b: 2
                        }
                    });
                    expect(log).not.toHaveBeenCalled();
                    var fn = wrapper.toFunction();
                    expect(log).toHaveBeenCalledWith(wrapper);
                    expect(fn).toBe(log);
                    expect(fn.a).toBe(1);
                    expect(fn.b).toBe(2);
                });

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

                    var wrapper = new Wrapper({
                        preprocessors: [pp1, pp2],
                        algorithm: Wrapper.algorithm.cascade
                    });
                    var fn = wrapper.toFunction();

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

                    var wrapper = new Wrapper({
                        done: done,
                        algorithm: Wrapper.algorithm.cascade
                    });
                    var fn = wrapper.toFunction();

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
                    var wrapper = new Wrapper({
                        preprocessors: [pp1, pp2],
                        done: done,
                        algorithm: Wrapper.algorithm.cascade
                    });
                    var fn = wrapper.toFunction();

                    expect(pp1).not.toHaveBeenCalled();
                    expect(pp2).not.toHaveBeenCalled();
                    expect(done).not.toHaveBeenCalled();
                    fn(1, 2, 3);
                    expect(pp1).toHaveBeenCalledWith(1, 2, 3);
                    expect(pp2).toHaveBeenCalledWith(3, 2, 1);
                    expect(done).toHaveBeenCalledWith(3, 1, 2);
                });

                it("accepts only Array as preprocessor result", function () {

                    var wrapper = new Wrapper({
                        preprocessors: [
                            function () {
                                return "a";
                            }
                        ],
                        algorithm: Wrapper.algorithm.cascade
                    });
                    var fn = wrapper.toFunction();
                    expect(fn).toThrow(new Wrapper.InvalidPreprocessor());
                });

            });

            describe("firstMatch", function () {

                it("applies done on the context with the arguments when no preprocessor defined", function () {

                    var context = {};
                    var done = jasmine.createSpy().and.callFake(function (a, b, c) {
                        expect(this).toBe(context);
                        return [c, b, a];
                    });

                    var wrapper = new Wrapper({
                        done: done,
                        algorithm: Wrapper.algorithm.firstMatch
                    });
                    var fn = wrapper.toFunction();

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
                    var wrapper = new Wrapper({
                        preprocessors: [pp1, pp2, pp3],
                        done: done,
                        algorithm: Wrapper.algorithm.firstMatch
                    });
                    var fn = wrapper.toFunction();

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

                it("accepts only Array or undefined as preprocessor result", function () {

                    var wrapper = new Wrapper({
                        preprocessors: [
                            function () {
                                return "a";
                            }
                        ],
                        algorithm: Wrapper.algorithm.firstMatch
                    });
                    var fn = wrapper.toFunction();
                    expect(fn).toThrow(new Wrapper.InvalidPreprocessor());
                });

            });

            describe("firstMatchCascade", function () {

                it("applies done on the context with the arguments when no preprocessor defined", function () {

                    var context = {};
                    var done = jasmine.createSpy().and.callFake(function (a, b, c) {
                        expect(this).toBe(context);
                        return [c, b, a];
                    });

                    var wrapper = new Wrapper({
                        done: done,
                        algorithm: Wrapper.algorithm.firstMatch
                    });
                    var fn = wrapper.toFunction();

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
                    var wrapper = new Wrapper({
                        preprocessors: [pp1, pp2, pp3],
                        done: done,
                        algorithm: Wrapper.algorithm.firstMatchCascade
                    });
                    var fn = wrapper.toFunction();

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

                it("accepts only Array or undefined as preprocessor result", function () {

                    var wrapper = new Wrapper({
                        preprocessors: [
                            function () {
                                return "a";
                            }
                        ],
                        algorithm: Wrapper.algorithm.firstMatchCascade
                    });
                    var fn = wrapper.toFunction();
                    expect(fn).toThrow(new Wrapper.InvalidPreprocessor());
                });

            });

        });

    });
});