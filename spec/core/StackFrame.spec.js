var df = require("dataflower"),
    StackFrame = df.StackFrame;

describe("core", function () {

    describe("StackFrame.prototype", function () {

        describe("configure", function () {

            it("accepts only valid configuration", function () {

                expect(function () {
                    new StackFrame();
                }).toThrow();

                expect(function () {
                    new StackFrame({
                        path: "",
                        row: 0,
                        col: 0
                    });
                }).toThrow(new StackFrame.DescriptionRequired());

                expect(function () {
                    new StackFrame({
                        description: "",
                        row: 0,
                        col: 0
                    });
                }).toThrow(new StackFrame.PathRequired());

                expect(function () {
                    new StackFrame({
                        description: "",
                        path: "",
                        col: 0
                    });
                }).toThrow(new StackFrame.RowRequired());

                expect(function () {
                    new StackFrame({
                        description: "",
                        path: "",
                        row: 0
                    });
                }).toThrow(new StackFrame.ColRequired());

            });

        });

        describe("toString", function () {

            it("converts the frame into string", function () {

                var frame = new StackFrame({
                    description: "x.y",
                    path: "d:\\test.js",
                    row: 10,
                    col: 20
                });
                expect(frame.toString()).toBe("\tat x.y (d:\\test.js:10:20)");
            });

            it("clears double spaces", function () {

                var frame = new StackFrame({
                    description: "",
                    path: "d:\\test.js",
                    row: 10,
                    col: 20
                });
                expect(frame.toString()).toBe("\tat (d:\\test.js:10:20)");

            });

        });


    });
});