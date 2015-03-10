var df = require("dataflower"),
    deepCopy = df.deepCopy,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("deepCopy", function () {

        it("accepts only null, undefined and Objects as options", function () {

            expect(function () {

                deepCopy({}, []);
                deepCopy({}, [], null);
                deepCopy({}, [], {});
                deepCopy({}, [], function () {
                });
            }).not.toThrow();

            [
                "string",
                123,
                false
            ].forEach(function (options) {
                    expect(function () {
                        deepCopy({}, [], options);
                    }).toThrow(new InvalidArguments());
                })
        });

        it("accepts any type of object as subject and sources", function () {

            expect(function () {
                deepCopy({}, []);
                deepCopy({}, [{}]);
                deepCopy({}, [{}, {}]);
                deepCopy(function () {
                }, [function () {
                }, function () {
                }]);
                deepCopy(new Date(), [new RegExp(), function () {
                }, []]);
                deepCopy({}, [null]);
                deepCopy({}, [undefined]);
            }).not.toThrow();

            expect(function () {
                deepCopy({}, [1, 2, 3]);
            }).toThrow(new InvalidArguments());

            expect(function () {
                deepCopy();
            }).toThrow(new InvalidArguments());

            expect(function () {
                deepCopy(null, [{}]);
            }).toThrow(new InvalidArguments());

            expect(function () {
                deepCopy(1, [{}]);
            }).toThrow(new InvalidArguments());

            expect(function () {
                deepCopy({}, {});
            }).toThrow(new InvalidArguments());
        });

        describe("the outcome if options is", function () {

            describe("null or undefined", function () {

                it("overrides properties of the subject with the properties of the sources", function () {

                    var subject = {};
                    deepCopy(subject, [{a: 1}, {b: 2}, {a: 3, c: 4}]);
                    expect(subject).toEqual({b: 2, a: 3, c: 4});
                });

                it("overrides native methods of the subject with the ones defined in the sources", function () {
                    var subject = {};
                    var toString = function () {
                        return "";
                    };
                    deepCopy(subject, [{toString: toString}]);
                    expect(subject.toString).toBe(toString);
                });

                it("returns the subject", function () {

                    var subject = {};
                    expect(deepCopy(subject, [])).toBe(subject);
                    expect(deepCopy(subject, [{a: 1}, {b: 2}])).toBe(subject);
                });

            });

            describe("a callback Function", function () {

                it("uses the callback to override the values", function () {

                    var o = {a: 1, b: 2, c: 3, d: 3};
                    deepCopy(o, [{a: 0, b: 1, c: 2}], function (subject, value, property) {
                        o[property] += value;
                    });
                    expect(o).toEqual({a: 1, b: 3, c: 5, d: 3});
                });

                it("uses the callback result if given, to override the value", function () {

                    var o = {a: 1, b: 2, c: 3, d: 3};
                    deepCopy(o, [{a: 0, b: 1, c: 2}], function (subject, value, property) {
                        return o[property] + value;
                    });
                    expect(o).toEqual({a: 1, b: 3, c: 5, d: 3});
                });

            });

            describe("an Object with callbacks", function () {

                it("calls deepCopy on the listed properties with the related callback Function as options", function () {

                    var o = {
                        a: {b: 1, c: 2},
                        d: {e: 3, f: 4}
                    };
                    deepCopy(o, [{
                        a: {b: 4, y: 6},
                        d: {x: 7}
                    }], {
                        a: function (a, value, property) {
                            if (property in a)
                                a[property] += value;
                            else
                                a[property] = value;
                        }
                    });

                    expect(o).toEqual({
                        a: {b: 5, c: 2, y: 6},
                        d: {x: 7}
                    });
                });

            });

            describe("an Array with a callback", function () {

                it("calls the callback on the the listed items", function () {

                    var a = [1, 2, 3];
                    deepCopy(a, [[4, 5, 6]], [
                        function (array, value, index) {
                            array.push(value);
                        }
                    ]);
                    expect(a).toEqual([1, 2, 3, 4, 5, 6]);
                });

            });

            describe("a nested Array with a callback", function () {

                it("calls deepCopy on the subject's sub-arrays with the source's sub-array items", function () {

                    var a = [
                        [1, 2, 3],
                        [4, 5, 6]
                    ];
                    deepCopy(a, [[[7, 8, 9]]], [
                        [
                            function (array, value, index) {
                                array.push(value);
                            }
                        ]
                    ]);
                    expect(a).toEqual([
                        [1, 2, 3, 7, 8, 9],
                        [4, 5, 6, 7, 8, 9]
                    ]);

                });

            });

            describe("a nested Array containing an Object with callbacks", function () {

                it("calls deepCopy on the subject's sub-objects with the source's sub-object properties", function () {

                    var a = [
                        {b: {x: 1}},
                        {b: {x: 2}}
                    ];
                    deepCopy(a, [[{b: {x: 3}}]], [{
                        b: function (object, value, property) {
                            object[property] += value;
                        }
                    }]);
                    expect(a).toEqual([{b: {x: 4}}, {b: {x: 5}}]);
                });

            });

            describe("a nested Array containing callback Functions as secondary and tertiary options", function () {

                it("calls the callback on the array before calling deepCopy on the items with the primary options", function () {

                    var log = jasmine.createSpy();
                    var a = [
                        [1, 2, 3],
                        [4, 5, 6]
                    ];
                    var b = [[4, 5, 6]];
                    deepCopy(a, [b], [
                        [log],
                        log,
                        log
                    ]);
                    expect(log.calls.count()).toBe(1 + 1 + 2 * 3);
                    expect(log.calls.argsFor(0)).toEqual([a, b, '0']);
                    expect(log.calls.argsFor(1)).toEqual([a, b[0], '0']);
                    expect(log.calls.argsFor(2)).toEqual([a[0], b[0][0], '0']);
                });

            });

        });

    });


});
