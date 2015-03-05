var df = require("dataflower"),
    Base = df.Base,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration,
    StackTrace = df.StackTrace,
    StackFrame = df.StackFrame,
    Wrapper = df.Wrapper,
    Plugin = df.Plugin;

var StackStringParser = Base.extend({
    messageFinder: /^[^\n]*\n/,
    inheritanceRelatedFramesFinder: /^[\s\S]*?\s+new\s+[^\n]+\n/,
    parse: function (options) {
        var rawFramesString = this.removeMessage(options.string);
        var framesString = this.removeInheritanceRelatedFrames(rawFramesString);
        options.frames = this.parseFramesString(framesString);
        delete(options.string);
        return options;
    },
    removeMessage: function (stackString) {
        return stackString.replace(this.messageFinder, "");
    },
    removeInheritanceRelatedFrames: function (rawFramesString) {
        return rawFramesString.replace(this.inheritanceRelatedFramesFinder, "");
    },
    parseFramesString: function (framesString) {
        var frameStrings = framesString.split("\n");
        var frames = [];
        for (var index in frameStrings)
            frames.push(this.parseFrameString(frameStrings[index]));
        return frames;
    },
    parseFrameString: new Wrapper({
        algorithm: Wrapper.algorithm.firstMatch,
        preprocessors: [
            function (frameString) {
                var match = frameString.match(/^\s*at\s+(?:\s*(.*?)\s*)\((.+):(\d+):(\d+)\)\s*$/);
                if (match)
                    return [{
                        description: match[1],
                        path: match[2],
                        row: Number(match[3]),
                        col: Number(match[4])
                    }];
            },
            function (frameString) {
                var match = frameString.match(/^\s*at\s+(.+):(\d+):(\d+)\s*$/);
                if (match)
                    return [{
                        description: "",
                        path: match[1],
                        row: Number(match[2]),
                        col: Number(match[3])
                    }];
            },
            function (frameString) {
                var match = frameString.match(/^\s*at\s+(?:\s*(.*?)\s*)\((.+)\)\s*$/);
                if (match)
                    return [{
                        description: match[1],
                        path: match[2],
                        row: -1,
                        col: -1
                    }];
            }
        ],
        done: function (result) {
            if (typeof (result) == "string")
                throw new StackStringParser.UnknownFrameFormat();
            return new StackFrame(result);
        }
    }).toFunction()
}, {
    UnknownFrameFormat: InvalidArguments.extend({
        message: "Unknown frame format"
    })
});


module.exports = new Plugin({
    StackStringParser: StackStringParser,
    parser: new StackStringParser(),
    test: function () {
        var options = this.parser.parse({
            string: new Error().stack
        });
        if (!options.frames)
            throw new Error();
    },
    setup: function () {
        StackTrace.prototype.mixin.wrapper.mixin({
            preprocessors: [
                function (options) {
                    if (options && typeof (options.string) == "string")
                        return [
                            this.parser.parse(options)
                        ];
                }.bind(this)
            ]
        });
    }
});
