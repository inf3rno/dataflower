var df = require("dataflower"),
    CompositeError = df.CompositeError,
    UserError = df.UserError,
    StackTrace = df.StackTrace;

describe("core", function () {

    describe("CompositeError", function () {

        describe("prototype", function () {

            describe("stack", function () {

                it("returns the joined stack of the contained Errors", function () {

                    var createError = function (options) {
                        return new options.type({
                            message: options.message
                        }).merge({
                                stackTrace: new StackTrace({
                                    toString: function () {
                                        return options.stack;
                                    }
                                })
                            });
                    };

                    var a = createError({
                        type: UserError,
                        message: "message.x.a",
                        stack: "stack.x.a"
                    });

                    var b = createError({
                        type: UserError,
                        message: "message.x.b",
                        stack: "stack.x.b"
                    });

                    var x = createError({
                        type: CompositeError,
                        message: "message.x",
                        stack: "stack.x"
                    }).merge({
                        a: a,
                        b: b
                    });

                    var y = createError({
                        type: UserError,
                        message: "message.y",
                        stack: "stack.y"
                    });

                    var root = createError({
                        type: CompositeError,
                        message: "message",
                        stack: "stack"
                    }).merge({
                        x: x,
                        y: y
                    });

                    expect(root.toString()).toBe("CompositeError: message");
                    expect(root.stack).toBe([
                        "CompositeError message",
                        "stack",
                        "caused by <x> CompositeError message.x",
                        "stack.x",
                        "caused by <x.a> UserError message.x.a",
                        "stack.x.a",
                        "caused by <x.b> UserError message.x.b",
                        "stack.x.b",
                        "caused by <y> UserError message.y",
                        "stack.y"
                    ].join("\n"));

                });

                it("supports native errors as well", function () {

                    var nativeError;
                    try {
                        (null).x();
                    }
                    catch (err) {
                        nativeError = err;
                    }
                    var composite = new CompositeError({
                        message: "message",
                        native: nativeError
                    });
                    expect(composite.stack).toContain(nativeError.stack);
                });

            });

        });

    });

});