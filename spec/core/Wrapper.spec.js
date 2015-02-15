var df = require("dflo2"),
    Wrapper = df.Wrapper,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("Wrapper", function () {

        describe("init", function () {

            it("accepts only an Array of Functions as preprocessors", function () {

                expect(function () {
                    new Wrapper();
                    new Wrapper({
                        preprocessors: []
                    });
                    new Wrapper({
                        preprocessors: [
                            function () {
                            },
                            function () {
                            }
                        ]
                    });
                }).not.toThrow();

                expect(function () {
                    new Wrapper({
                        preprocessors: {}
                    })
                }).toThrow(new Wrapper.ArrayRequired());

                expect(function () {
                    new Wrapper({
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
                    new Wrapper({
                        done: function () {
                        }
                    })
                }).not.toThrow();

                expect(function () {
                    new Wrapper({
                        done: {}
                    })
                }).toThrow(new Wrapper.FunctionRequired());

            });

            it("accepts only native Object instance as properties", function () {

                expect(function () {
                    new Wrapper({
                        properties: {}
                    });
                }).not.toThrow();

                expect(function () {
                    new Wrapper({
                        properties: []
                    })
                }).toThrow(new Wrapper.PropertiesRequired());

            });

            it("accepts only a Function as logic", function () {

                expect(function () {
                    new Wrapper({
                        logic: function () {
                        }
                    })
                }).not.toThrow();

                expect(function () {
                    new Wrapper({
                        logic: {}
                    })
                }).toThrow(new Wrapper.LogicRequired());

            });

        });

        describe("mergeOptions", function () {

            it("accepts only a single config object", function () {

                expect(function () {
                    new Wrapper().mergeOptions({});
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mergeOptions();
                }).toThrow(new InvalidArguments());

                expect(function () {
                    new Wrapper().mergeOptions(null);
                }).toThrow(new InvalidArguments());

                expect(function () {
                    new Wrapper().mergeOptions({}, {});
                }).toThrow(new InvalidArguments());

            });


            it("accepts only an Array of Functions as preprocessors", function () {

                expect(function () {
                    new Wrapper().mergeOptions({
                        preprocessors: []
                    });
                    new Wrapper().mergeOptions({
                        preprocessors: [
                            function () {
                            },
                            function () {
                            }
                        ]
                    });
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mergeOptions({
                        preprocessors: {}
                    })
                }).toThrow(new Wrapper.ArrayRequired());

                expect(function () {
                    new Wrapper().mergeOptions({
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
                    new Wrapper().mergeOptions({
                        done: function () {
                        }
                    })
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mergeOptions({
                        done: {}
                    })
                }).toThrow(new Wrapper.FunctionRequired());

            });

            it("accepts only a Function as logic", function () {

                expect(function () {
                    new Wrapper().mergeOptions({
                        logic: function () {
                        }
                    })
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mergeOptions({
                        logic: {}
                    })
                }).toThrow(new Wrapper.LogicRequired());

            });

            it("accepts only native Object instance as properties", function () {

                expect(function () {
                    new Wrapper().mergeOptions({
                        properties: {}
                    });
                }).not.toThrow();

                expect(function () {
                    new Wrapper().mergeOptions({
                        properties: []
                    })
                }).toThrow(new Wrapper.PropertiesRequired());

            });

            it("returns a new options Object", function () {

                var options = {};
                var merged = new Wrapper().mergeOptions(options);
                expect(merged).not.toBe(options);
                expect(merged.constructor === Object).toBe(true);
                expect(merged.preprocessors instanceof Array).toBe(true);
                expect(merged.done instanceof Function).toBe(true);
                expect(merged.properties.constructor === Object).toBe(true);
            });

            it("creates a new preprocessors Array", function () {
                var a = [];
                var wrapper = new Wrapper({
                    preprocessors: a
                });
                var merged = wrapper.mergeOptions({});
                expect(merged.preprocessors instanceof Array).toBe(true);
                expect(merged.preprocessors).not.toBe(a);
                expect(wrapper.preprocessors).toBe(a);
            });

            it("inherits preprocessors if not given", function () {
                var a = [
                    function () {
                    },
                    function () {
                    }
                ];
                var wrapper = new Wrapper({
                    preprocessors: a
                });
                var merged = wrapper.mergeOptions({});
                expect(merged.preprocessors).not.toBe(a);
                expect(merged.preprocessors).toEqual(a);
            });

            it("merges preprocessors if given", function () {
                var x = function () {
                    },
                    y = function () {
                    },
                    z = function () {
                    },
                    q = function () {
                    },
                    a = [x, y],
                    b = [z, q];
                var wrapper = new Wrapper({
                    preprocessors: a
                });
                var merged = wrapper.mergeOptions({
                    preprocessors: b
                });
                expect(merged.preprocessors).not.toBe(a);
                expect(merged.preprocessors).not.toBe(b);
                expect(merged.preprocessors).toEqual([x, y, z, q]);
            });

            it("inherits done if not given", function () {

                var a = function () {
                };
                var wrapper = new Wrapper({
                    done: a
                });
                var merged = wrapper.mergeOptions({});
                expect(merged.done).toBe(a);
            });

            it("overrides done if given", function () {

                var a = function () {
                };
                var b = function () {
                };
                var wrapper = new Wrapper({
                    done: a
                });
                var merged = wrapper.mergeOptions({
                    done: b
                });
                expect(merged.done).toBe(b);
            });

            it("inherits logic if not given", function () {

                var a = function () {
                };
                var wrapper = new Wrapper({
                    logic: a
                });
                var merged = wrapper.mergeOptions({});
                expect(merged.logic).toBe(a);
            });

            it("overrides logic if given", function () {

                var a = function () {
                };
                var b = function () {
                };
                var wrapper = new Wrapper({
                    logic: a
                });
                var merged = wrapper.mergeOptions({
                    logic: b
                });
                expect(merged.logic).toBe(b);
            });

            it("creates a new properties Object", function () {
                var a = {};
                var wrapper = new Wrapper({
                    properties: a
                });
                var merged = wrapper.mergeOptions({});
                expect(merged.properties.constructor === Object).toBe(true);
                expect(merged.properties).not.toBe(a);
                expect(wrapper.properties).toBe(a);
            });

            it("inherits properties if not given", function () {
                var a = {
                    x: 1,
                    y: 2
                };
                var wrapper = new Wrapper({
                    properties: a
                });
                var merged = wrapper.mergeOptions({});
                expect(merged.properties).not.toBe(a);
                expect(merged.properties).toEqual(a);
            });

            it("merges properties if given", function () {
                var a = {a: 1, b: 2},
                    b = {b: 3, c: 4};
                var wrapper = new Wrapper({
                    properties: a
                });
                var merged = wrapper.mergeOptions({
                    properties: b
                });
                expect(merged.properties).not.toBe(a);
                expect(merged.properties).not.toBe(b);
                expect(merged.properties).toEqual({a: 1, b: 3, c: 4});
            });

        });

        describe("wrap", function () {

            it("accepts only a single config object or nothing as options", function () {

                expect(function () {
                    new Wrapper().wrap();
                    new Wrapper().wrap({});
                }).not.toThrow();

                expect(function () {
                    new Wrapper().wrap(null);
                }).toThrow(new InvalidArguments());

                expect(function () {
                    new Wrapper().wrap({}, {});
                }).toThrow(new InvalidArguments());

            });

            it("calls mergeOptions with the options and logic with the merged options and returns the result of logic", function () {

                var options1 = {
                    preprocessors: [],
                    done: function () {
                    },
                    properties: {}
                };
                var options2 = {
                    preprocessors: [],
                    done: function () {
                    },
                    properties: {},
                    logic: jasmine.createSpy().and.callFake(function (options2) {
                        return results;
                    })
                };

                var results = function () {
                };
                var MockWrapper = Wrapper.extend({
                    mergeOptions: jasmine.createSpy().and.callFake(function (options1) {
                        return options2;
                    })
                });

                var wrapper = new MockWrapper();
                expect(wrapper.mergeOptions).not.toHaveBeenCalled();
                expect(options2.logic).not.toHaveBeenCalled();
                expect(wrapper.wrap(options1)).toBe(results);
                expect(wrapper.mergeOptions).toHaveBeenCalledWith(options1);
                expect(options2.logic).toHaveBeenCalledWith(options2);
            });

            it("extends the results returned by the logic with the properties given in options", function () {

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

        describe("logic", function () {

            describe("preprocessor", function () {

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
                            logic: Wrapper.logic.preprocessor.cascade
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
                            logic: Wrapper.logic.preprocessor.cascade
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
                            logic: Wrapper.logic.preprocessor.cascade
                        });

                        expect(done).not.toHaveBeenCalled();
                        fn(1, 2, 3);
                        expect(done).toHaveBeenCalledWith(3, 1, 2);
                    });

                });

            });

        });

    });
});