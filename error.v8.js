var df = require("dflo2"),
    Base = df.Base,
    Frame = df.Frame,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration,
    Plugin = df.Plugin,
    UserError = df.UserError;

var StackStringParser = Base.extend({
    messageFinder: /^[^\n]*\n/,
    inheritanceRelatedFramesFinder: /^[\s\S]*?\s+new\s+[^\n]+\n/,
    frameFinders: [
        {
            pattern: /^\s*at\s+(?:\s*(.*?)\s*)\((.+):(\d+):(\d+)\)\s*$/,
            processor: function (match) {
                return {
                    description: match[1],
                    path: match[2],
                    row: Number(match[3]),
                    col: Number(match[4])
                }
            }
        },
        {
            pattern: /^\s*at\s+(.+):(\d+):(\d+)\s*$/,
            processor: function (match) {
                return {
                    description: "",
                    path: match[1],
                    row: Number(match[2]),
                    col: Number(match[3])
                }
            }
        }

    ],
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
        for (var index = 0, length = frameStrings.length; index < length; ++index) {
            var options = this.parseFrameString(frameStrings[index]);
            frames.push(new Frame(options));
        }
        return frames;
    },
    parseFrameString: function (frameString) {
        for (var index = 0, length = this.frameFinders.length; index < length; ++index) {
            var frameFinder = this.frameFinders[index];
            var match = frameString.match(frameFinder.pattern);
            if (match)
                return frameFinder.processor(match);
        }
        throw new StackStringParser.UnknownFrameFormat();
    }
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
        UserError.prototype.createStack.options.preprocessors.push(function (options) {
            return [this.parser.parse(options)];
        }.bind(this));
    }
});
