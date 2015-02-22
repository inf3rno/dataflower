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
                        }).mixin({
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
                    }).mixin({
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
                    }).mixin({
                        x: x,
                        y: y
                    });

                    expect(root.toString()).toBe("CompositeError: message");
                    expect(root.stack).toBe([
                        "CompositeError message",
                        "stack",
                        "CompositeError x message.x",
                        "stack.x",
                        "UserError x.a message.x.a",
                        "stack.x.a",
                        "UserError x.b message.x.b",
                        "stack.x.b",
                        "UserError y message.y",
                        "stack.y"
                    ].join("\n"));

                });

            });

        });

    });

});