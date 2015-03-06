var df = require("dataflower"),
    StackTrace = df.StackTrace,
    StackFrame = df.StackFrame,
    StackStringParser = df.StackStringParser;

describe("core", function () {

    describe("StackStringParser.prototype", function () {

        describe("parse", function () {

            it("accepts only stack string", function () {

                var parser = new StackStringParser();
                expect(function () {
                    parser.parse({});
                }).toThrow(new StackStringParser.StackStringRequired());
            });

            it("creates trace from the stack string", function () {
                var stackString = [
                        "Error",
                        "	at module.exports.extend.configure (http://example.com/df.js:75:31)",
                        "	at new Descendant (http://example.com/df.js:11:27)",
                        "	at custom (http://example.com/spec/example.spec.js:222:23)",
                        "	at Base.<anonymous> (http://example.com/spec/example.spec.js:224:13)",
                        "	at http://example.com/spec/example.spec.js:10:20",
                        "	at Array.forEach (native)"
                    ].join("\n"),
                    parser = new StackStringParser();

                expect(parser.parse(stackString)).toEqual(
                    new StackTrace({
                        frames: [
                            new StackFrame({
                                description: "custom",
                                path: "http://example.com/spec/example.spec.js",
                                row: 222,
                                col: 23
                            }),
                            new StackFrame({
                                description: "Base.<anonymous>",
                                path: "http://example.com/spec/example.spec.js",
                                row: 224,
                                col: 13
                            }),
                            new StackFrame({
                                description: "",
                                path: "http://example.com/spec/example.spec.js",
                                row: 10,
                                col: 20
                            }),
                            new StackFrame({
                                description: "Array.forEach",
                                path: "native",
                                row: -1,
                                col: -1
                            })
                        ]
                    })
                );
            });
        });

    });
});