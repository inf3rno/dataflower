var df = require("dataflower"),
    deep = df.deep,
    InvalidArguments = df.InvalidArguments,
    dummy = df.dummy,
    shallowClone = df.shallowClone;

describe("core", function () {

    describe("deep", function () {

        var assertOptions = function (options, exception) {
            var expectation = expect(function () {
                deep({}, {}, options);
            });
            if (exception)
                expectation.toThrow(exception);
            else
                expectation.not.toThrow();
        };
        var err = new InvalidArguments.Nested({path: []});

        it("accepts only null, undefined and Objects as options", function () {

            assertOptions();
            assertOptions(null);
            assertOptions({});

            assertOptions("string", err);
            assertOptions(123, err);
            assertOptions(false, err);
            assertOptions(dummy, err);
        });

        it("accepts only required, subject, property, defaultProperty as options properties", function () {

            assertOptions({
                required: false,
                subject: dummy,
                property: {},
                defaultProperty: dummy
            });

            assertOptions({
                x: dummy
            }, err);
        });

        it("accepts only Boolean as required", function () {

            assertOptions({
                required: false
            });

            [
                null,
                dummy,
                {},
                "string",
                123
            ].forEach(function (invalidRequired) {
                    assertOptions({
                        required: invalidRequired
                    }, err);
                });
        });

        it("accepts only Function as subject", function () {

            assertOptions({
                subject: dummy
            });

            [
                null,
                {},
                "string",
                123,
                false
            ].forEach(function (invalidSubject) {
                    assertOptions({
                        subject: invalidSubject
                    }, err);
                });
        });

        it("accepts only Object as property", function () {

            assertOptions({
                property: {}
            });

            [
                null,
                dummy,
                "string",
                123,
                false
            ].forEach(function (invalidProperty) {
                    assertOptions({
                        property: invalidProperty
                    }, err);
                });
        });

        it("accepts only options or Function as nested property", function () {
            [
                dummy,
                {}
            ].forEach(function (property) {
                    assertOptions({
                        property: {
                            x: property
                        }
                    });
                });

            [
                null,
                "string",
                123,
                false
            ].forEach(function (invalidProperty) {
                    assertOptions({
                        property: {
                            x: invalidProperty
                        }
                    }, err);
                });
        });

        it("accepts only Function or Object as defaultProperty", function () {
            [
                dummy,
                {}
            ].forEach(function (defaultProperty) {
                    assertOptions({
                        defaultProperty: defaultProperty
                    });
                });

            [
                null,
                "string",
                123,
                false
            ].forEach(function (invalidDefaultProperty) {
                    assertOptions({
                        defaultProperty: invalidDefaultProperty
                    }, err);
                });
        });

        it("throw Error when the source is undefined and required is true", function () {

            assertOptions({
                required: true
            });

            expect(function () {
                deep({}, undefined, {
                    required: true
                });
            }).toThrow(new InvalidArguments.Nested({path: []}));
        });

        it("returns the subject", function () {

            var subject = deep({a: 1}, {b: 2});
            expect(subject).toEqual({a: 1});
        });

        it("calls the subject callback if given", function () {

            var log = jasmine.createSpy();

            deep({a: 1}, {b: 2}, {
                subject: log
            });

            expect(log).toHaveBeenCalledWith({a: 1}, {b: 2}, jasmine.any(Function), []);

        });

        it("replaces the subject with the result of the subject callback, if it is defined", function () {

            var subject = deep({a: 1}, {b: 2}, {
                subject: function () {
                    return {c: 3};
                }
            });
            expect(subject).toEqual({c: 3});
        });

        it("calls the defaultProperty on the enumerable properties if Function is given", function () {

            var log = jasmine.createSpy();
            deep({a: 1}, {b: 2, c: 3}, {
                defaultProperty: function (subject, value, property, path) {
                    expect(arguments.length).toBe(4);
                    log(subject, value, property, shallowClone(path));
                }
            });
            expect(log.calls.count()).toBe(2);
            expect(log).toHaveBeenCalledWith({a: 1}, 2, "b", ["b"]);
            expect(log).toHaveBeenCalledWith({a: 1}, 3, "c", ["c"]);
        });

        it("calls deep with the defaultProperty as options on the enumerable properties if Object is given", function () {

            var log = jasmine.createSpy();
            deep({a: 1}, {b: 2, c: 3}, {
                defaultProperty: {
                    subject: function (subject, source, eachProperty, path) {
                        expect(arguments.length).toBe(4);
                        log(subject, source, eachProperty, shallowClone(path));
                    }
                }
            });
            expect(log.calls.count()).toBe(2);
            expect(log).toHaveBeenCalledWith(undefined, 2, jasmine.any(Function), ["b"]);
            expect(log).toHaveBeenCalledWith(undefined, 3, jasmine.any(Function), ["c"]);
        });

        it("calls the property sub-option on a specific the enumerable property if Function is given and the property name matches", function () {

            var log = jasmine.createSpy();
            deep({a: 1}, {b: 2, c: 3}, {
                property: {
                    b: function (subject, value, property, path) {
                        expect(arguments.length).toBe(4);
                        log(subject, value, property, shallowClone(path));
                    }
                }
            });
            expect(log.calls.count()).toBe(1);
            expect(log).toHaveBeenCalledWith({a: 1}, 2, "b", ["b"]);
        });

        it("calls deep with the property sub-option as options on the enumerable property if Object is given and the property name matches", function () {

            var log = jasmine.createSpy();
            deep({a: 1}, {b: 2, c: 3}, {
                property: {
                    b: {
                        subject: function (subject, source, eachProperty, path) {
                            expect(arguments.length).toBe(4);
                            log(subject, source, eachProperty, shallowClone(path));
                        }
                    }
                }
            });
            expect(log.calls.count()).toBe(1);
            expect(log).toHaveBeenCalledWith(undefined, 2, jasmine.any(Function), ["b"]);
        });

        it("uses the property sub-option if both defaultProperty and a matching property sub-option is given", function () {

            var log = jasmine.createSpy();
            deep({a: 1}, {b: 2, c: 3}, {
                defaultProperty: function (subject, value, property, path) {
                    log("defaultProperty", property);
                },
                property: {
                    b: function (subject, value, property, path) {
                        log("property", property);
                    }
                }
            });
            expect(log.calls.count()).toBe(2);
            expect(log).toHaveBeenCalledWith("property", "b");
            expect(log).toHaveBeenCalledWith("defaultProperty", "c");
        });

        it("throws Error when a property sub-option is required, but not given in the source", function () {

            expect(function () {
                deep({a: 1}, {c: 3}, {
                    property: {
                        b: {
                            required: true,
                            subject: dummy
                        }
                    }
                });
            }).toThrow(new InvalidArguments.Nested({path: ["b"]}));

            expect(function () {
                deep({a: 1}, {c: 3}, {
                    property: {
                        b: {
                            required: false,
                            subject: dummy
                        }
                    }
                });
            }).not.toThrow();

            expect(function () {
                deep({a: 1}, {b: undefined, c: 3}, {
                    property: {
                        b: {
                            required: true,
                            subject: dummy
                        }
                    }
                });
            }).toThrow(new InvalidArguments.Nested({path: ["b"]}));
        });

        it("throws Error when a property sub-option is required, but only native value is given from the Object.prototype", function () {

            expect(function () {
                deep({a: 1}, {c: 3}, {
                    property: {
                        toString: {
                            required: true,
                            subject: dummy
                        }
                    }
                });
            }).toThrow(new InvalidArguments.Nested({path: ["toString"]}));
        });

        it("uses the result of the subject callback as subject in the property and defaultProperty options", function () {

            var log = jasmine.createSpy();
            deep({a: 1}, {b: 2, c: 3}, {
                subject: function () {
                    return {d: 4};
                },
                defaultProperty: function (subject, value, property, path) {
                    log(property, subject);
                },
                property: {
                    b: function (subject, value, property, path) {
                        log(property, subject);
                    }
                }
            });
            expect(log.calls.count()).toBe(2);
            expect(log).toHaveBeenCalledWith("b", {d: 4});
            expect(log).toHaveBeenCalledWith("c", {d: 4});
        });

        it("can use the eachProperty in the subject callback to iterate through properties before returning a result", function () {

            var log = jasmine.createSpy();
            deep({a: 1}, {b: 2, c: 3}, {
                subject: function (subject, source, eachProperty, path) {
                    eachProperty();
                    return {d: 4};
                },
                defaultProperty: function (subject, value, property, path) {
                    log(property, subject);
                },
                property: {
                    b: function (subject, value, property, path) {
                        log(property, subject);
                    }
                }
            });
            expect(log.calls.count()).toBe(2);
            expect(log).toHaveBeenCalledWith("b", {a: 1});
            expect(log).toHaveBeenCalledWith("c", {a: 1});
        });

        it("can override the subject and the source with eachProperty arguments", function () {

            var log = jasmine.createSpy();
            var result = deep({a: 1}, {b: 2, c: 3}, {
                subject: function (subject, source, eachProperty, path) {
                    eachProperty({x: 1}, {y: 2, z: 3});
                    return {d: 4};
                },
                defaultProperty: function (subject, value, property, path) {
                    log(property, subject);
                },
                property: {
                    b: function (subject, value, property, path) {
                        log(property, subject);
                    }
                }
            });
            expect(log.calls.count()).toBe(2);
            expect(log).toHaveBeenCalledWith("y", {x: 1});
            expect(log).toHaveBeenCalledWith("z", {x: 1});
            expect(result).toEqual({d: 4});
        });

        it("overrides the subject value with the return value (if not undefined) of the property and defaultProperty options", function () {

            var subject = deep({a: 1}, {b: 2, c: 3, toString: 4}, {
                defaultProperty: function () {
                    return "default";
                },
                property: {
                    b: function () {
                        return "b";
                    },
                    toString: {
                        subject: function () {
                            return "s";
                        }
                    }
                }
            });
            expect(subject).toEqual({a: 1, b: "b", c: "default", toString: "s"});
        });

        it("throws Error if the subject is not enumerable, but there is return value by the property and defaultProperty options", function () {

            expect(function () {
                deep(null, {b: 2}, {
                    defaultProperty: function () {
                        return "default";
                    }
                });
            }).toThrow(new InvalidArguments.Nested({path: ["b"]}));
        });

    });

});