var df = require("dataflower"),
    StackTrace = df.StackTrace,
    StackFrame = df.StackFrame;

describe("core", function () {

    describe("StackTrace.prototype", function () {

        describe("build", function (){

            it("clones the frames array", function (){
                var frames = [
                    Object.create(StackFrame.prototype),
                    Object.create(StackFrame.prototype)
                ];
                var stack = new StackTrace({
                    frames: frames
                });
                expect(stack.frames).not.toBe(frames);
                expect(stack.frames).toEqual(frames);
            });

        });

        describe("merge", function () {

            it("accepts only a valid frames array", function () {

                expect(function () {
                    new StackTrace({
                        frames: {}
                    });
                }).toThrow(new StackTrace.StackFramesRequired());

                expect(function () {
                    new StackTrace({
                        frames: [
                            {},
                            {}
                        ]
                    });
                }).toThrow(new StackTrace.StackFrameRequired());

            });

        });

        describe("toString", function () {

            it("converts the frames into string", function () {

                var mockFrame = Object.create(StackFrame.prototype),
                    cnt = 0;
                mockFrame.toString = function () {
                    return String(++cnt);
                };

                var stack = new StackTrace({
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