var df = require("dataflower"),
    deepClone = df.deepClone,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("deepClone", function () {

        it("accepts only null, undefined and Objects as options", function () {

            expect(function () {

                deepClone({});
                deepClone({}, null);
                deepClone({}, {});
            }).not.toThrow();

            [
                "string",
                123,
                false,
                function () {
                }
            ].forEach(function (options) {
                    expect(function () {
                        deepClone({}, options);
                    }).toThrow(new InvalidArguments.Nested());
                })
        });

        it("accepts any type of variable as source", function () {

        });

        describe("the algorithm depending on the options", function () {

            describe("when it is null, undefined, empty Object, empty Array", function () {

                it("clones the same way as shallowClone does", function () {

                    [null, undefined, {}, []].forEach(function (options) {
                        [
                            undefined,
                            null,
                            "string",
                            123,
                            true,
                            false,
                            function () {
                            }
                        ].forEach(function (value) {
                                expect(deepClone(value, options)).toBe(value);
                            });

                        var object = {a: {x: 1}};
                        var instance = deepClone(object, options);
                        expect(instance.a).toBe(object.a);
                        expect(instance).not.toBe(object);
                    });

                });

            });


            describe("when it is a non-empty object", function () {

                it("accepts only Functions as @subject", function () {

                    var subject = {};

                    expect(function () {
                        deepClone(subject, {
                            "@subject": function () {
                            }
                        });
                    }).not.toThrow();

                    expect(function () {
                        deepClone(subject, {
                            "@subject": {}
                        });
                    }).toThrow(new InvalidArguments.Nested());

                });

                it("does not accept primitives, RegExp and Date as subject if any non-@subject option given", function () {

                    [
                        undefined,
                        null,
                        "string",
                        123,
                        true,
                        false,
                        function () {
                        },
                        new Date(),
                        new RegExp()
                    ].forEach(function (subject) {
                            expect(function () {
                                deepClone(subject, {
                                    "@subject": function () {
                                    }
                                });
                            }).not.toThrow();
                            [
                                {
                                    "@property": function () {
                                    }
                                },
                                {
                                    property: function () {
                                    }
                                }
                            ].forEach(function (options) {
                                    expect(function () {
                                        deepClone(subject, options);
                                    }).toThrow(new InvalidArguments.Nested({path: []}));
                                });
                        });
                });

                describe("which contains @subject and @property callbacks", function () {

                    it("turns off the default shallowClone behavior", function () {

                        var subject = {a: {b: 1}};
                        expect(deepClone(subject, {
                            "@subject": function (subject, eachProperty, path) {
                                return subject;
                            }
                        })).toBe(subject);

                        expect(deepClone(subject, {
                            "@subject": function () {
                            }
                        })).toBe(undefined);
                    });

                    it("calls the @property by each of the properties", function () {
                        var subject = {a: {b: 1}};
                        var instance = deepClone(subject, {
                            "@subject": function (subject, eachProperty, path) {
                                return subject;
                            }
                        });
                        expect(instance).toBe(subject);
                    });

                    it("calls the @subject before calling the @property sequence", function () {

                        var subject = {
                            a: 1,
                            b: 2
                        };
                        var instance = {};
                        var log = jasmine.createSpy();
                        deepClone(subject, {
                            "@subject": function () {
                                log.apply(this, arguments);
                                return instance;
                            },
                            "@property": log
                        });
                        expect(log.calls.count()).toBe(1 + 2);
                        expect(log.calls.argsFor(0)).toEqual([subject, jasmine.any(Function), jasmine.any(Array)]);
                        expect(log).toHaveBeenCalledWith(instance, 1, "a", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(instance, 2, "b", jasmine.any(Array));
                    });

                    describe("the 2nd argument of @subject called eachProperty", function () {

                        it("is a callback Function", function () {
                            var callback;
                            deepClone({}, {
                                "@subject": function (subject, eachProperty, path) {
                                    callback = eachProperty;
                                }
                            });
                            expect(callback instanceof Function).toBe(true);
                        });

                        it("can be used to call the @property sequence manually", function () {
                            var a = {i: 1, j: 2};
                            var instance = {id: 1};
                            var result = {id: 2};
                            var log = jasmine.createSpy();
                            var options = {
                                "@subject": function (subject, eachProperty) {
                                    log("before:each", subject);
                                    eachProperty(instance);
                                    log("after:each", instance);
                                    return result;
                                },
                                "@property": function (instance, value, property) {
                                    log("each", property, instance);
                                }
                            };
                            expect(deepClone(a, options)).toBe(result);
                            expect(log.calls.count()).toBe(2 + 2);
                            expect(log.calls.argsFor(0)).toEqual(["before:each", a]);
                            expect(log.calls.argsFor(1)).toEqual(["each", "i", instance]);
                            expect(log.calls.argsFor(2)).toEqual(["each", "j", instance]);
                            expect(log.calls.argsFor(3)).toEqual(["after:each", instance]);
                        });

                    });

                    it("uses the return value (if defined) of the @property to override the original value", function () {

                        var a = {i: 1, j: 2};
                        var options = {
                            "@property": function (instance, value, property, path) {
                                return property;
                            }
                        };
                        var instance = deepClone(a, options);
                        expect(instance).toEqual({i: "i", j: "j"});
                        a.k = "k";
                        expect(instance.k).toBe(a.k);
                    });

                    it("can use Array as subject", function () {
                        var a = [1, 2, 3];
                        var log = jasmine.createSpy();
                        var options = {
                            "@property": log
                        };
                        var instance = deepClone(a, options);
                        expect(instance).toEqual(a);
                        expect(log.calls.count()).toBe(3);
                        expect(log).toHaveBeenCalledWith(instance, a[0], "0", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(instance, a[1], "1", jasmine.any(Array));
                        expect(log).toHaveBeenCalledWith(instance, a[2], "2", jasmine.any(Array));
                    });

                });

                describe("which has other properties than @subject and @property", function () {

                    describe("when the property contains a native Function", function () {

                        it("won't be called", function () {

                            var toString = function () {
                                return "string";
                            };
                            var a = {
                                toString: toString
                            };
                            deepClone(a, {});
                            expect(a.toString).toBe(toString);
                        });

                    });

                    describe("when the property contains a callback Function", function () {

                        it("is called the same way as @property is called, but only when the property name matches", function () {

                            var a = {i: 1, j: 2};
                            var log = jasmine.createSpy();
                            var options = {
                                j: log
                            };
                            var result = deepClone(a, options);
                            expect(log.calls.count()).toBe(1);
                            expect(log).toHaveBeenCalledWith(result, 2, "j", jasmine.any(Array));
                        });

                        it("overrides @property (if it is given)", function () {

                            var a = {i: 1, j: 2};
                            var log = jasmine.createSpy();
                            var options = {
                                "@property": function (instance, value, property) {
                                    log("each", property);
                                },
                                j: function (instance, value, property) {
                                    log("j", property);
                                }
                            };
                            deepClone(a, options);
                            expect(log).toHaveBeenCalledWith("each", "i");
                            expect(log).not.toHaveBeenCalledWith("each", "j");
                            expect(log).not.toHaveBeenCalledWith("j", "i");
                            expect(log).toHaveBeenCalledWith("j", "j");
                        });

                    });

                });

                describe("which has nested options", function () {

                    it("calls deepClone on the value of the subject and the nested option", function () {

                        var a = {c: {d: 1, e: 2}};
                        var cloneA = deepClone(a, {
                            c: {
                                "@property": function (cloneC, value, property) {
                                    return property;
                                }
                            }
                        });
                        expect(cloneA).toEqual({c: {d: "d", e: "e"}});
                        expect(cloneA).not.toEqual(a);
                        expect(a.isPrototypeOf(cloneA)).toBe(true);
                        expect(a.c.isPrototypeOf(cloneA.c)).toBe(true);
                    });

                    it("throws error when the subject has a non-enumerable value by the property and enumerable option is given", function () {

                        var a = {c: 1};
                        expect(function () {
                            deepClone(a, {
                                c: {
                                    "@property": function () {
                                    }
                                }
                            });
                        }).toThrow(new InvalidArguments.Nested({path: ["c"]}));
                    });


                    describe("the 3rd arguments of @subject and the 4th arguments of @property called path", function () {

                        it("is an Array which stores the actual path", function () {

                            var a = {b: {c: {d: 1, e: 2}, f: 3}, g: 4};

                            var log = jasmine.createSpy();
                            var options = {
                                "@property": function (instance, value, property, path) {
                                    log.apply(null, path);
                                    if (value instanceof Object)
                                        return deepClone(value, options, path);
                                    return value;
                                }
                            };
                            deepClone(a, options);
                            expect(log.calls.count()).toBe(1 + 1 + 2 + 1 + 1);
                            expect(log).toHaveBeenCalledWith("b");
                            expect(log).toHaveBeenCalledWith("b", "c");
                            expect(log).toHaveBeenCalledWith("b", "c", "d");
                            expect(log).toHaveBeenCalledWith("b", "c", "e");
                            expect(log).toHaveBeenCalledWith("b", "f");
                            expect(log).toHaveBeenCalledWith("g");
                        });

                    });


                });

            });

            describe("when it is an Array", function () {

                it("does not accept more than 2 items", function () {

                    expect(function () {
                        deepClone({}, [
                            function () {
                            }
                        ]);
                        deepClone({}, [
                            function () {
                            },
                            function () {
                            }
                        ]);

                    }).not.toThrow();

                    expect(function () {
                        deepClone({}, [
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

                        var a = {i: 1, j: 2, k: 3};
                        var log = jasmine.createSpy();

                        deepClone(a, {
                            "@property": log
                        });

                        var calls = log.calls.count();
                        log.calls.reset();

                        deepClone(a, [log]);
                        expect(calls).toEqual(log.calls.count());
                    });

                });

                describe("which contains two items", function () {

                    it("creates a new options in which the first item will be the @subject and the second item will be the @property", function () {

                        var a = {i: 1, j: 2, k: 3};
                        var log = jasmine.createSpy();

                        deepClone(a, {
                            "@subject": log,
                            "@property": log
                        });

                        var calls = log.calls.count();
                        log.calls.reset();

                        deepClone(a, [log, log]);
                        expect(calls).toEqual(log.calls.count());
                    });

                });

            });


        });
    });
});
