var NativeError = Error,
    df = require("dflo2"),
    Factory = df.Factory,
    Object = df.Object,
    Stack = df.Stack,
    Frame = df.Frame,
    InvalidArguments = df.InvalidArguments,
    InvalidConfiguration = df.InvalidConfiguration,
    Plugin = df.Plugin;

var StackFactory = Factory.extend({
    parser: undefined,
    init: function (options, preprocessor) {
        Factory.prototype.init.apply(this, arguments);
        if (!this.parser)
            throw new StackFactory.StackStringParserRequired();
    },
    create: function (Stack, nativeError) {
        if (nativeError.stack !== undefined)
            return this.parser.parse(Stack, nativeError.stack);
    }
}, {
    StackStringParserRequired: InvalidConfiguration.extend({
        message: "StackStringParser required."
    })
});

var StackStringParser = Object.extend({
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
    parse: function (Stack, stackString) {
        var rawFramesString = this.removeMessage(stackString);
        var framesString = this.removeInheritanceRelatedFrames(rawFramesString);
        var frames = this.parseFramesString(framesString);
        return new Stack({
            frames: frames
        });
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
    StackFactory: StackFactory,
    stackFactory: StackFactory.instance({
        parser: StackStringParser.instance()
    }),
    test: function () {
        var stack = this.stackFactory.create(Stack, new NativeError());
        var string = stack.toString();
        if (typeof (string) != "string")
            throw new NativeError();
    },
    setup: function () {
        Stack.instance.container.add({
            factory: this.stackFactory
        });
    }
});
