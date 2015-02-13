var df = require("../../df");
var v8 = require("../../df.v8");

describe("df.v8", function () {

    var StackStringParser = v8.StackStringParser;
    var Stack = df.Stack;
    var Frame = df.Frame;

    describe("StackStringParser", function () {

        describe("parse", function () {

            it("creates a Stack from the stack string", function () {
                var stackString = [
                    "Error",
                    "	at module.exports.extend.init (http://example.com/df.js:75:31)",
                    "	at new Descendant (http://example.com/df.js:11:27)",
                    "	at custom (http://example.com/spec/example.spec.js:222:23)",
                    "	at Object.<anonymous> (http://example.com/spec/example.spec.js:224:13)",
                    "	at http://example.com/spec/example.spec.js:10:20"
                ].join("\n");

                var parser = new StackStringParser();
                var StackRelative = Stack.extend();

                var stack = parser.parse(StackRelative, stackString);
                expect(stack instanceof StackRelative);
                expect(stack.frames).toEqual([
                    new Frame({
                        description: "custom",
                        path: "http://example.com/spec/example.spec.js",
                        row: 222,
                        col: 23
                    }),
                    new Frame({
                        description: "Object.<anonymous>",
                        path: "http://example.com/spec/example.spec.js",
                        row: 224,
                        col: 13
                    }),
                    new Frame({
                        description: "",
                        path: "http://example.com/spec/example.spec.js",
                        row: 10,
                        col: 20
                    })
                ]);

            });
        });

    });
});