var df = require("dataflower"),
    v8 = require("dataflower/error.v8"),
    Frame = df.StackFrame,
    StackStringParser = v8.StackStringParser;

describe("error.v8", function () {

    describe("StackStringParser.prototype", function () {

        describe("parse", function () {

            it("creates frames from the stack string", function () {
                var stackString = [
                        "Error",
                        "	at module.exports.extend.init (http://example.com/df.js:75:31)",
                        "	at new Descendant (http://example.com/df.js:11:27)",
                        "	at custom (http://example.com/spec/example.spec.js:222:23)",
                        "	at Base.<anonymous> (http://example.com/spec/example.spec.js:224:13)",
                        "	at http://example.com/spec/example.spec.js:10:20"
                    ].join("\n"),
                    parser = new StackStringParser();

                var options = parser.parse({
                    string: stackString
                });
                expect(options.string).not.toBeDefined();
                expect(options.frames).toEqual([
                    new Frame({
                        description: "custom",
                        path: "http://example.com/spec/example.spec.js",
                        row: 222,
                        col: 23
                    }),
                    new Frame({
                        description: "Base.<anonymous>",
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