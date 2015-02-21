var df = require("dataflower"),
    Stack = df.Stack,
    Frame = df.StackFrame;

describe("core", function () {

    describe("Stack.prototype", function () {

        describe("prepare", function (){

            it("clones the frames array", function (){
                var frames = [
                    Object.create(Frame.prototype),
                    Object.create(Frame.prototype)
                ];
                var stack = new Stack({
                    frames: frames
                });
                expect(stack.frames).not.toBe(frames);
                expect(stack.frames).toEqual(frames);
            });

        });

        describe("mixin", function () {

            it("accepts only a valid frames array", function () {

                expect(function () {
                    new Stack({
                        frames: {}
                    });
                }).toThrow(new Stack.StackFramesRequired());

                expect(function () {
                    new Stack({
                        frames: [
                            {},
                            {}
                        ]
                    });
                }).toThrow(new Stack.StackFrameRequired());

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