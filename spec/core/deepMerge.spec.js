var df = require("dataflower"),
    deepMerge = df.deepMerge,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("deepMerge", function () {

        it("accepts only null, undefined and Objects as options", function () {

            expect(function () {

                deepMerge({}, []);
                deepMerge({}, [], null);
                deepMerge({}, [], {});
            }).not.toThrow();

            [
                "string",
                123,
                false,
                function () {
                }
            ].forEach(function (options) {
                    expect(function () {
                        deepMerge({}, [], options);
                    }).toThrow(new InvalidArguments.Nested());
                })
        });

        it("accepts any type of object as subject and sources", function () {

            expect(function () {
                deepMerge({}, []);
                deepMerge({}, [{}]);
                deepMerge({}, [{}, {}]);
                deepMerge(function () {
                }, [function () {
                }, function () {
                }]);
                deepMerge(new Date(), [new RegExp(), function () {
                }, []]);
                deepMerge({}, [null]);
                deepMerge({}, [undefined]);
            }).not.toThrow();

            expect(function () {
                deepMerge({}, [1, 2, 3]);
            }).toThrow(new InvalidArguments.Nested({path: [0]}));

            expect(function () {
                deepMerge();
            }).toThrow(new InvalidArguments.Nested());

            expect(function () {
                deepMerge(null, [{}]);
            }).toThrow(new InvalidArguments.Nested());

            expect(function () {
                deepMerge(1, [{}]);
            }).toThrow(new InvalidArguments.Nested());

            expect(function () {
                deepMerge({}, {});
            }).toThrow(new InvalidArguments());
        });

        it("throws error when the source contains reserved properties like @source and @property", function () {

            [
                {
                    source: {
                        "@property": function () {
                        }
                    },
                    path: [0, "@property"]
                },
                {
                    source: {
                        "@source": function () {
                        }
                    },
                    path: [0, "@source"]
                }
            ].forEach(function (options) {
                    expect(function () {
                        deepMerge({}, [options.source]);
                    }).toThrow(new InvalidArguments.Nested({path: options.path}));
                });
        });

        describe("the algorithm depending on the options", function () {

            describe("when it is null, undefined, empty Object, empty Array", function () {

                it("copies the properties the same way as shallowMerge would", function () {

                    [null, undefined, {}, []].forEach(function (options) {
                        var a = {i: 1, j: 2};
                        var b = {j: 3, k: 4};
                        var c = {j: 5, l: 6};
                        expect(deepMerge(a, [b, c], options)).toBe(a);
                        expect(a).toEqual({i: 1, j: 5, k: 4, l: 6});
                    });
                });

            });

            describe("when it is a non-empty object", function () {

                it("accepts only Functions as @source", function () {

                    var subject = {};
                    var sources = [{}];

                    expect(function () {
                        deepMerge(subject, sources, {
                            "@source": function () {
                            }
                        });
                    }).not.toThrow();

                    expect(function () {
                        deepMerge(subject, sources, {
                            "@source": {}
                        });
                    }).toThrow(new InvalidArguments.Nested());

                });

                describe("which contains @source and @property callbacks", function () {

                    it("turns off the default shallowMerge behavior", function () {

                        var a = {i: 1, j: 2};
                        var b = {j: 3, k: 4};
                        var c = {j: 5, l: 6};
                        var options = {
                            "@source": function () {
                            },
                            "@property": function () {
                            }
                        };
                        expect(deepMerge(a, [b, c], options)).toBe(a);
                        expect(a).toEqual({i: 1, j: 2});
                    });

                    it("calls the @source by each of the sources", function () {

                        var a = {i: 1, j: 2};
                        var b = {j: 3, k: 4};
                        var c = {j: 5, l: 6};
                        var log = jasmine.createSpy();
                        var options = {
                            "@source": log,
                            "@property": function () {
                            }
                        };
                        expect(deepMerge(a, [b, c], options)).toBe(a);
                        expect(log.calls.count()).toBe(2);
                        expect(log).toHaveBeenCalledWith(a, b, "0", jasmine.any(Function), jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, c, "1", jasmine.any(Function), jasmine.any(Array));
                    });

                    it("calls the @property by each of the source properties", function () {

                        var a = {i: 1, j: 2};
                        var b = {j: 3, k: 4};
                        var c = {j: 5, l: 6};
                        var log = jasmine.createSpy();
                        var options = {
                            "@source": function () {
                            },
                            "@property": log
                        };
                        expect(deepMerge(a, [b, c], options)).toBe(a);
                        expect(log.calls.count()).toBe(4);
                        expect(log).toHaveBeenCalledWith(a, b.j, "j", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, b.k, "k", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, c.j, "j", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, c.l, "l", jasmine.any(Array));
                    });

                    it("calls the @source before calling the @property sequence by every source", function () {

                        var a = {i: 1, j: 2};
                        var b = {j: 3, k: 4};
                        var c = {j: 5, l: 6};
                        var log = jasmine.createSpy();
                        var options = {
                            "@source": log,
                            "@property": log
                        };
                        expect(deepMerge(a, [b, c], options)).toBe(a);
                        expect(log.calls.count()).toBe(6);
                        expect(log).toHaveBeenCalledWith(a, b, "0", jasmine.any(Function), jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, b.j, "j", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, b.k, "k", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, c, "1", jasmine.any(Function), jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, c.j, "j", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, c.l, "l", jasmine.any(Array));
                    });

                    describe("the 4th argument of @source called eachProperty", function () {

                        it("is a callback Function", function () {

                            var callback;
                            deepMerge({}, [{}], {
                                "@source": function (subject, source, index, eachProperty, path) {
                                    callback = eachProperty;
                                },
                                "@property": function () {
                                }
                            });
                            expect(callback instanceof Function).toBe(true);
                        });

                        it("can be used to call the @property sequence manually", function () {

                            var a = {i: 1, j: 2};
                            var b = {j: 3, k: 4};
                            var c = {j: 5, l: 6};
                            var log = jasmine.createSpy();
                            var options = {
                                "@source": function (subject, source, index, eachProperty) {
                                    log("before:each", source);
                                    eachProperty();
                                    log("after:each", source);
                                },
                                "@property": function (subject, value, property) {
                                    log("each", property);
                                }
                            };
                            expect(deepMerge(a, [b, c], options)).toBe(a);
                            expect(log.calls.count()).toBe(2 * 2 + 2 * 2);
                            expect(log.calls.argsFor(0)).toEqual(["before:each", b]);
                            expect(log.calls.argsFor(1)).toEqual(["each", "j"]);
                            expect(log.calls.argsFor(2)).toEqual(["each", "k"]);
                            expect(log.calls.argsFor(3)).toEqual(["after:each", b]);
                            expect(log.calls.argsFor(4)).toEqual(["before:each", c]);
                            expect(log.calls.argsFor(5)).toEqual(["each", "j"]);
                            expect(log.calls.argsFor(6)).toEqual(["each", "l"]);
                            expect(log.calls.argsFor(7)).toEqual(["after:each", c]);
                        });

                    });

                    it("uses the return value (if defined) of the @property to override the original value", function () {

                        var a = {i: 1, j: 2};
                        var b = {j: 3, k: 4};
                        var c = {j: 5, l: 6};
                        var options = {
                            "@source": function () {
                            },
                            "@property": function (subject, value, property, path) {
                                return property;
                            }
                        };
                        expect(deepMerge(a, [b, c], options)).toBe(a);
                        expect(a).toEqual({i: 1, j: "j", k: "k", l: "l"});
                    });

                    it("can use Array as source", function () {

                        var a = {};
                        var b = [1, 2, 3];
                        var log = jasmine.createSpy();
                        var options = {
                            "@source": log,
                            "@property": log
                        };
                        expect(deepMerge(a, [b], options)).toBe(a);
                        expect(log.calls.count()).toBe(1 + 3);
                        expect(log).toHaveBeenCalledWith(a, b, "0", jasmine.any(Function), jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, b[0], "0", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, b[1], "1", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a, b[2], "2", jasmine.any(Array));
                    });

                });

                describe("which has other properties than @source and @property", function () {

                    describe("when the property contains a native Function", function () {

                        it("won't be called", function () {

                            var a = {};
                            var b = {
                                toString: function () {
                                    return "string";
                                }
                            };
                            expect(deepMerge(a, [b], {})).toBe(a);
                            expect(a.toString).toBe(b.toString);
                        });

                    });

                    describe("when the property contains a callback Function", function () {

                        it("turns off the default shallowMerge behavior only by the actual property", function () {

                            var a = {i: 1, j: 2};
                            var b = {j: 3, k: 4};
                            var c = {j: 5, l: 6};
                            var options = {
                                j: function () {
                                }
                            };
                            expect(deepMerge(a, [b, c], options)).toBe(a);
                            expect(a).toEqual({i: 1, j: 2, k: 4, l: 6});
                        });

                        it("is called the same way as @property is called, but only when the property name matches", function () {

                            var a = {i: 1, j: 2};
                            var b = {j: 3, k: 4};
                            var c = {j: 5, l: 6};
                            var log = jasmine.createSpy();
                            var options = {
                                j: log
                            };
                            expect(deepMerge(a, [b, c], options)).toBe(a);
                            expect(log.calls.count()).toBe(2);
                            expect(log).toHaveBeenCalledWith(a, 3, "j", jasmine.any(Array));
                            expect(log).toHaveBeenCalledWith(a, 5, "j", jasmine.any(Array));
                        });

                        it("overrides @property (if it is given)", function () {

                            var a = {i: 1, j: 2};
                            var b = {j: 3, k: 4};
                            var c = {j: 5, l: 6};
                            var log = jasmine.createSpy();
                            var options = {
                                "@property": function (subject, value, property) {
                                    log("each", property);
                                },
                                j: function (subject, value, property) {
                                    log("j", property);
                                }
                            };
                            expect(deepMerge(a, [b, c], options)).toBe(a);
                            expect(log).not.toHaveBeenCalledWith("each", "j");
                            expect(log).toHaveBeenCalledWith("each", "k");
                            expect(log).toHaveBeenCalledWith("each", "l");
                            expect(log).toHaveBeenCalledWith("j", "j");
                            expect(log).not.toHaveBeenCalledWith("j", "k");
                            expect(log).not.toHaveBeenCalledWith("j", "l");
                        });

                    });

                });

                describe("which has nested options", function () {

                    it("keeps the value of the subject's property and calls deepMerge on it with the value of the actual source as sources and the Object as options", function () {

                        var a = [[1, 2, 3]];
                        var b = [[4, 5, 6]];
                        var c = [[7, 8, 9]];
                        var log = jasmine.createSpy();
                        var options = {
                            "@property": {
                                "@source": log,
                                "@property": log
                            }
                        };
                        expect(deepMerge(a, [b, c], options)).toBe(a);
                        expect(log.calls.count()).toBe(2 + 2 * 3);
                        expect(log).toHaveBeenCalledWith(a[0], b[0], "0", jasmine.any(Function), jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a[0], b[0][0], "0", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a[0], b[0][1], "1", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a[0], b[0][2], "2", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a[0], c[0], "0", jasmine.any(Function), jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a[0], c[0][0], "0", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a[0], c[0][1], "1", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(a[0], c[0][2], "2", jasmine.any(Array));
                    });

                    it("throws error when the subject does not have an Object on the property", function () {

                        var a = {};
                        var b = {c: {}};
                        expect(function () {
                            deepMerge(a, [b], {
                                c: {}
                            });
                        }).toThrow(new InvalidArguments.Nested({path: [0, "c"]}));
                    });


                    describe("the 5th arguments of @source and the 4th arguments of @property called path", function () {

                        it("is an Array which stores the actual path", function () {

                            var a = {b: {c: {d: {}}}};
                            var b = {b: {c: {d: {e: 1, f: 2}, g: 3}, h: 4}, i: 5};
                            var c = {b: {c: {d: {j: 1, k: 2}, l: 3}, m: 4}, n: 5};

                            var log = jasmine.createSpy();
                            var options = {
                                "@property": function (subject, value, property, path) {
                                    log.apply(null, path);
                                    if (subject[property] instanceof Object)
                                        return deepMerge(subject[property], [value], options, path);
                                    return value;
                                }
                            };
                            expect(deepMerge(a, [b, c], options)).toBe(a);
                            expect(log.calls.count()).toBe(2 * (1 + 1 + 1 + 2 + 1 + 1 + 1));
                            expect(log).toHaveBeenCalledWith("0", "b");
                            expect(log).toHaveBeenCalledWith("0", "b", "c");
                            expect(log).toHaveBeenCalledWith("0", "b", "c", "d");
                            expect(log).toHaveBeenCalledWith("0", "b", "c", "d", "e");
                            expect(log).toHaveBeenCalledWith("0", "b", "c", "d", "f");
                            expect(log).toHaveBeenCalledWith("0", "b", "c", "g");
                            expect(log).toHaveBeenCalledWith("0", "b", "h");
                            expect(log).toHaveBeenCalledWith("0", "i");
                            expect(log).toHaveBeenCalledWith("1", "b");
                            expect(log).toHaveBeenCalledWith("1", "b", "c");
                            expect(log).toHaveBeenCalledWith("1", "b", "c", "d");
                            expect(log).toHaveBeenCalledWith("1", "b", "c", "d", "j");
                            expect(log).toHaveBeenCalledWith("1", "b", "c", "d", "k");
                            expect(log).toHaveBeenCalledWith("1", "b", "c", "l");
                            expect(log).toHaveBeenCalledWith("1", "b", "m");
                            expect(log).toHaveBeenCalledWith("1", "n");
                        });

                    });


                });

            });

            describe("when it is an Array", function () {

                it("does not accept more than 2 items", function () {

                    expect(function () {
                        deepMerge({}, [{}], [
                            function () {
                            }
                        ]);
                        deepMerge({}, [{}], [
                            function () {
                            },
                            function () {
                            }
                        ]);

                    }).not.toThrow();

                    expect(function () {
                        deepMerge({}, [{}], [
                            function () {
                            },
                            function () {
                            },
                            function () {
                            }
                        ]);

                    }).toThrow(new InvalidArguments.Nested());

                });

                describe("which contains a single item", function () {

                    it("creates a new options in which the item will be the @property", function () {

                        var a = {i: 1, j: 2};
                        var b = {j: 3, k: 4};
                        var c = {j: 5, l: 6};
                        var log = jasmine.createSpy();

                        expect(deepMerge(a, [b, c], {
                            "@property": log
                        })).toBe(a);

                        var calls = log.calls.count();
                        log.calls.reset();

                        expect(deepMerge(a, [b, c], [log])).toBe(a);
                        expect(calls).toEqual(log.calls.count());
                    });

                });

                describe("which contains two items", function () {

                    it("creates a new options in which the first item will be the @source and the second item will be the @property", function () {

                        var a = {i: 1, j: 2};
                        var b = {j: 3, k: 4};
                        var c = {j: 5, l: 6};
                        var log = jasmine.createSpy();

                        expect(deepMerge(a, [b, c], {
                            "@source": log,
                            "@property": log
                        })).toBe(a);

                        var calls = log.calls.count();
                        log.calls.reset();

                        expect(deepMerge(a, [b, c], [log, log])).toBe(a);
                        expect(calls).toEqual(log.calls.count());
                    });

                });

            });

        });

    });

});
