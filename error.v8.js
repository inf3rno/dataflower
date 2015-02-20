var df = require("dataflower"),
    Base = df.Base,
    Frame = df.Frame,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration,
    Plugin = df.Plugin,
    Stack = df.Stack,
    Wrapper = df.Wrapper;

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
        for (var index = 0, length = frameStrings.length; index < length; ++index)
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
            }
        ],
        done: function (result) {
            if (typeof (result) == "string")
                throw new StackStringParser.UnknownFrameFormat();
            return new Frame(result);
        }
    }).wrap()
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
        Stack.prototype.mixin.options.mixin({
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
