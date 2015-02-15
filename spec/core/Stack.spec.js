var df = require("dataflower"),
    Stack = df.Stack,
    Frame = df.Frame;

describe("core", function () {

    describe("Stack", function () {

        describe("init", function () {

            it("accepts configuration options", function () {

                var o = {
                        x: {}
                    },
                    stack = new Stack(o);
                expect(stack.x).toBe(o.x);
            });

            it("accepts only a valid frames array", function () {

                expect(function () {
                    new Stack({
                        frames: {}
                    });
                }).toThrow(new Stack.FramesRequired());

                expect(function () {
                    new Stack({
                        frames: [
                            {},
                            {}
                        ]
                    });
                }).toThrow(new Stack.FramesRequired());

            });

        });

        describe("toString", function () {

            it("converts the frames into string", function () {

                var mockFrame = Object.create(Frame.prototype),
                    cnt = 0;
                mockFrame.toString = function () {
                    return String(++cnt);
                };

                var stack = new Stack({
                    frames: [
                        mockFrame,
                        mockFrame,
                        mockFrame
                    ]
                });
                expect(stack.toString()).toBe([1, 2, 3].join("\n"));
            });

        });


    });
});