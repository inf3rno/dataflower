var df = require("dflo2");

describe("df", function () {

    var Frame = df.Frame;

    describe("Frame", function () {

        describe("init", function () {

            it("accepts only valid configuration", function () {

                expect(function () {
                    new Frame();
                }).toThrow();

                expect(function () {
                    new Frame({
                        path: "",
                        row: 0,
                        col: 0
                    });
                }).toThrow(new Frame.DescriptionRequired());

                expect(function () {
                    new Frame({
                        description: "",
                        row: 0,
                        col: 0
                    });
                }).toThrow(new Frame.PathRequired());

                expect(function () {
                    new Frame({
                        description: "",
                        path: "",
                        col: 0
                    });
                }).toThrow(new Frame.RowRequired());

                expect(function () {
                    new Frame({
                        description: "",
                        path: "",
                        row: 0
                    });
                }).toThrow(new Frame.ColRequired());

            });

        });

        describe("toString", function () {

            it("converts the frame into string", function () {

                var frame = new Frame({
                    description: "x.y",
                    path: "d:\\test.js",
                    row: 10,
                    col: 20
                });
                expect(frame.toString()).toBe("at x.y (d:\\test.js:10:20)");
            });

            it("clears double spaces", function () {

                var frame = new Frame({
                    description: "",
                    path: "d:\\test.js",
                    row: 10,
                    col: 20
                });
                expect(frame.toString()).toBe("at (d:\\test.js:10:20)");

            });

        });


    });
});