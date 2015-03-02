describe("environment", function () {

    describe("Object", function () {

        describe("create", function () {

            it("returns an object in where inherited properties are enumerable", function () {

                var a = {x: {}, y: 1};
                var b = Object.create(a);
                var props = [];
                for (var prop in b)
                    props.push(prop);
                expect(props).toEqual(["x", "y"]);
            });

        });

        describe("defineProperty", function () {

            it("can define a property on an object, which is not enumerable", function () {

                var a = {};
                Object.defineProperty(a, "x", {
                    enumerable: false,
                    value: 1
                });
                var props = [];
                for (var prop in a)
                    props.push(prop);
                expect(props).toEqual([]);
                expect(a.x).toBe(1);

            });

        });

        describe("prototype", function () {

            it("is NOT an Object instance, which has an object type", function () {

                expect(Object.prototype instanceof Object).toBe(false);
                expect(typeof (Object.prototype)).toBe("object");
                expect(Object.prototype).not.toBe(null);
            });

            describe("hasOwnProperty", function () {

                it("can distinguish inherited and own properties", function () {

                    var a = {x: 1, y: 2};
                    var b = Object.create(a);
                    b.x = 1;
                    expect(a.hasOwnProperty("x")).toBe(true);
                    expect(b.hasOwnProperty("x")).toBe(true);
                    expect(a.hasOwnProperty("y")).toBe(true);
                    expect(b.hasOwnProperty("y")).toBe(false);
                });

            });

        });

    });

    describe("Error", function () {

        it("is an Object relative", function () {

            expect(Error instanceof Object).toBe(true);
        });

        describe("prototype", function () {

            it("is an Object instance", function () {

                expect(Error.prototype instanceof Object).toBe(true);
            });

        });
    });

    describe("null", function () {

        it("is has object type", function () {

            expect(typeof (null)).toBe("object");

        });

        it("is not an Object instance", function () {
            expect(null instanceof Object).toBe(false);
        });

    });

});