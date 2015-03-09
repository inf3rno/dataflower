var EventEmitter = require("events").EventEmitter;

var last = 0;
var id = function () {
    return ++last;
};

var watch = function (subject, property, listener) {
    if (!(subject instanceof Object))
        throw new InvalidArguments();
    if (typeof (property) != "string")
        throw new InvalidArguments();
    if (!(listener instanceof Function))
        throw new InvalidArguments();

    var observer = subject._observer;
    if (!subject.hasOwnProperty("_observer")) {
        observer = new EventEmitter();
        observer.values = {};
        Object.defineProperty(subject, "_observer", {
            writable: false,
            enumerable: false,
            configurable: false,
            value: observer
        });
    }
    if (!observer.values.hasOwnProperty(property)) {
        var enumerable = true;
        if (subject.hasOwnProperty(property)) {
            var descriptor = Object.getOwnPropertyDescriptor(subject, property);
            if (!descriptor.configurable)
                throw new InvalidArguments();
            if (descriptor.set || descriptor.get)
                throw new InvalidArguments();
            if (!descriptor.writable)
                throw new InvalidArguments();
            enumerable = descriptor.enumerable;
        }
        observer.values[property] = subject[property];
        Object.defineProperty(subject, property, {
            set: function (value) {
                var oldValue = observer.values[property];
                observer.values[property] = value;
                if (value !== oldValue)
                    observer.emit(property, value, oldValue, property, subject);
            },
            get: function () {
                return observer.values[property];
            },
            enumerable: enumerable,
            configurable: false
        });
    }
    observer.on(property, listener);
};

var unwatch = function (subject, property, listener) {
    if (!(subject instanceof Object))
        throw new InvalidArguments();
    if (typeof (property) != "string")
        throw new InvalidArguments();
    if (!(listener instanceof Function))
        throw new InvalidArguments();

    if (subject.hasOwnProperty("_observer"))
        subject._observer.removeListener(property, listener);
};

var extend = function (Ancestor, properties, staticProperties) {
    if (!(Ancestor instanceof Function))
        throw new InvalidArguments();
    if (arguments.length > 3)
        throw new InvalidArguments();
    var Descendant = function () {
        if (this.init instanceof Function)
            this.init.apply(this, arguments);
    };
    Descendant.prototype = clone(Ancestor.prototype);
    if (properties)
        merge(Descendant.prototype, properties);
    Descendant.prototype.constructor = Descendant;
    merge(Descendant, Ancestor);
    if (staticProperties)
        merge(Descendant, staticProperties);
    return Descendant;
};

var clone = function (subject) {
    if (typeof (subject) != "object" || subject === null)
        return subject;
    if (subject instanceof Array)
        return subject.slice();
    if (subject instanceof Date)
        return new Date(subject);
    if (subject instanceof RegExp)
        return new RegExp(subject);
    if (subject.clone instanceof Function)
        return subject.clone();
    return Object.create(subject);
};

var merge = function (subject, source) {
    if (!(subject instanceof Object))
        throw new InvalidArguments();
    if (subject.merge instanceof Function)
        return subject.merge.apply(subject, Array.prototype.slice.call(arguments, 1));
    return shallowCopy.apply(null, arguments);
};

var shallowCopy = function (subject, source) {
    if (!(subject instanceof Object))
        throw new InvalidArguments();
    var sources = Array.prototype.slice.call(arguments, 1);
    for (var index in sources) {
        source = sources[index];
        if (source === undefined || source === null)
            continue;
        if (!(source instanceof Object))
            throw new InvalidArguments();
        for (var property in source)
            subject[property] = source[property];
    }
    return subject;
};

var Base = extend(Object, {
    init: function () {
        this.build();
        this.merge.apply(this, arguments);
        this.configure();
    },
    clone: function () {
        var instance = Object.create(this);
        instance.build();
        return instance;
    },
    build: function () {
        Object.defineProperty(this, "id", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: id()
        });
    },
    merge: function (source) {
        var parameters = [this];
        parameters.push.apply(parameters, arguments);
        return shallowCopy.apply(null, parameters);
    },
    configure: function () {
    }
}, {
    extend: function (properties, staticProperties) {
        return extend(this, properties, staticProperties);
    }
});
Base.merge = Base.prototype.merge;

var UserError = extend(Error, {
    name: "UserError",
    message: "",
    stackTrace: undefined,
    init: Base.prototype.init,
    clone: Base.prototype.clone,
    build: Base.prototype.build,
    merge: Base.prototype.merge,
    configure: function () {
        var nativeError = new Error();
        var parser = new StackStringParser();
        this.stackTrace = parser.parse(nativeError.stack);
        Object.defineProperty(this, "stack", {
            configurable: false,
            enumerable: false,
            get: this.toStackString.bind(this)
        });
    },
    toStackString: function () {
        var string = "";
        string += this.name;
        string += " " + this.message + "\n";
        string += this.stackTrace;
        return string;
    }
}, {
    parser: undefined,
    extend: Base.extend,
    merge: Base.merge
});

var InvalidConfiguration = UserError.extend({
    name: "InvalidConfiguration"
});

var InvalidArguments = UserError.extend({
    name: "InvalidArguments"
});

InvalidArguments.Empty = InvalidArguments.extend({
    message: "Arguments required."
});

var InvalidResult = UserError.extend({
    name: "InvalidResult"
});

var CompositeError = UserError.extend({
    name: "CompositeError",
    toStackString: function (key) {
        var string = UserError.prototype.toStackString.call(this);
        if (typeof (key) == "string")
            key += ".";
        else
            key = "";
        for (var property in this) {
            var error = this[property];
            if (!(error instanceof Error))
                continue;
            string += "\ncaused by <" + key + property + "> ";
            if (error instanceof CompositeError)
                string += error.toStackString(key + property);
            else
                string += error.stack;
        }
        return string;
    }
});

var StackTrace = Base.extend({
    frames: [],
    string: undefined,
    build: function () {
        Base.prototype.build.call(this);
        this.frames = clone(this.frames);
    },
    merge: function (source) {
        var sources = [];
        for (var sourceIndex in arguments) {
            source = arguments[sourceIndex];
            if (source === undefined || source === null)
                continue;
            if (!(source instanceof Object))
                throw new InvalidArguments();

            if (source.frames !== undefined) {
                if (!(source.frames instanceof Array))
                    throw new StackTrace.StackFramesRequired();
                for (var frameIndex in source.frames)
                    if (!(source.frames[frameIndex] instanceof StackFrame))
                        throw new StackTrace.StackFrameRequired();
                this.frames.push.apply(this.frames, source.frames);
            }
            var backup = {
                frames: this.frames
            };
            shallowCopy(this, source);
            shallowCopy(this, backup);
        }
        return this;
    },
    toString: function () {
        if (this.string === undefined)
            this.string = this.frames.join("\n");
        return this.string;
    }
}, {
    StackFramesRequired: InvalidConfiguration.extend({
        message: "An array of frames is required."
    }),
    StackFrameRequired: InvalidConfiguration.extend({
        message: "StackFrame required as frames member."
    })
});

var StackFrame = Base.extend({
    description: undefined,
    path: undefined,
    row: undefined,
    col: undefined,
    string: undefined,
    configure: function () {
        if (typeof (this.description) != "string")
            throw new StackFrame.DescriptionRequired();
        if (typeof (this.path) != "string")
            throw new StackFrame.PathRequired();
        if (isNaN(this.row))
            throw new StackFrame.RowRequired();
        if (isNaN(this.col))
            throw new StackFrame.ColRequired();
    },
    toString: function () {
        if (this.string !== undefined)
            return this.string;
        this.string = "\tat " + this.description + " (" + this.path + ":" + this.row + ":" + this.col + ")";
        if (this.description === "")
            this.string = this.string.replace("  ", " ");

        return this.string;
    }
}, {
    DescriptionRequired: InvalidConfiguration.extend({
        message: "Description string required."
    }),
    PathRequired: InvalidConfiguration.extend({
        message: "Path string required."
    }),
    RowRequired: InvalidConfiguration.extend({
        message: "Row number required."
    }),
    ColRequired: InvalidConfiguration.extend({
        message: "Col number required"
    })
});

var Plugin = Base.extend({
    id: undefined,
    installed: false,
    error: undefined,
    dependencies: undefined,
    test: function () {
    },
    setup: function () {
    },
    configure: function () {
        this.dependencies = {};
    },
    install: function () {
        if (this.installed)
            return;
        if (!this.compatible())
            throw new Plugin.Incompatible();
        for (var id in this.dependencies) {
            var dependency = this.dependencies[id];
            dependency.install();
        }
        this.setup();
        this.installed = true;
    },
    compatible: function () {
        if (this.error !== undefined)
            return !this.error;
        for (var id in this.dependencies) {
            var dependency = this.dependencies[id];
            this.error = dependency.debug();
            if (this.error !== undefined)
                return !this.error;
        }
        try {
            this.test();
            this.error = false;
        } catch (error) {
            this.error = error;
        }
        return !this.error;
    },
    debug: function () {
        this.compatible();
        return this.error;
    },
    dependency: function () {
        for (var index in arguments) {
            var plugin = arguments[index];
            if (!(plugin instanceof Plugin))
                throw new Plugin.PluginRequired();
            this.dependencies[plugin.id] = plugin;
        }
    }
}, {
    Incompatible: UserError.extend({
        name: "Incompatible",
        message: "The Plugin you wanted to install is incompatible with the current environment."
    }),
    PluginRequired: InvalidArguments.extend({
        message: "Plugin required."
    })
});

var Wrapper = Base.extend({
    preprocessors: [],
    done: function () {
        return Array.prototype.slice(arguments);
    },
    algorithm: function (wrapper) {
        return function () {
            return wrapper.done.apply(this, arguments);
        };
    },
    properties: {},
    build: function () {
        Base.prototype.build.call(this);
        this.preprocessors = clone(this.preprocessors);
        this.properties = clone(this.properties);
    },
    merge: function (source) {
        for (var sourceIndex in arguments) {
            source = arguments[sourceIndex];
            if (source === undefined || source === null)
                continue;
            if (!(source instanceof Object))
                throw new InvalidArguments();

            if (source.preprocessors !== undefined) {
                if (!(source.preprocessors instanceof Array))
                    throw new Wrapper.ArrayRequired();
                for (var preprocessorIndex in source.preprocessors)
                    if (!(source.preprocessors[preprocessorIndex] instanceof Function))
                        throw new Wrapper.PreprocessorRequired();
                this.preprocessors.push.apply(this.preprocessors, source.preprocessors);
            }

            if (source.done !== undefined && !(source.done instanceof Function))
                throw new Wrapper.FunctionRequired();

            if (source.algorithm !== undefined && !(source.algorithm instanceof Function))
                throw new Wrapper.AlgorithmRequired();

            if (source.properties !== undefined) {
                if (!(source.properties instanceof Object))
                    throw new Wrapper.PropertiesRequired();
                shallowCopy(this.properties, source.properties);
            }

            var backup = {
                preprocessors: this.preprocessors,
                properties: this.properties
            };
            shallowCopy(this, source);
            shallowCopy(this, backup);
        }
        return this;
    },
    toFunction: function () {
        var func = this.algorithm(this);
        if (!(func instanceof Function))
            throw new Wrapper.InvalidAlgorithm();
        shallowCopy(func,
            {
                wrapper: this
            },
            this.properties
        );
        return func;
    }
}, {
    done: {
        dummy: function () {
        },
        echo: function () {
            return Array.prototype.slice(arguments);
        }
    },
    algorithm: {
        cascade: function (wrapper) {
            return function () {
                var parameters = Array.prototype.slice.apply(arguments);
                for (var index in wrapper.preprocessors) {
                    var preprocessor = wrapper.preprocessors[index];
                    parameters = preprocessor.apply(this, parameters);
                    if (!(parameters instanceof Array))
                        throw new Wrapper.InvalidPreprocessor();
                }
                return wrapper.done.apply(this, parameters);
            };
        },
        firstMatch: function (wrapper) {
            return function () {
                var parameters = arguments,
                    match;
                for (var index in wrapper.preprocessors) {
                    var preprocessor = wrapper.preprocessors[index];
                    match = preprocessor.apply(this, arguments);
                    if (match !== undefined) {
                        parameters = match;
                        if (!(parameters instanceof Array))
                            throw new Wrapper.InvalidPreprocessor();
                        break;
                    }
                }
                return wrapper.done.apply(this, parameters);
            };
        },
        firstMatchCascade: function (wrapper) {
            return function () {
                var parameters = arguments;
                var reduce = function () {
                    var match;
                    for (var index in wrapper.preprocessors) {
                        var preprocessor = wrapper.preprocessors[index];
                        match = preprocessor.apply(this, parameters);
                        if (match !== undefined) {
                            parameters = match;
                            if (!(parameters instanceof Array))
                                throw new Wrapper.InvalidPreprocessor();
                            break;
                        }
                    }
                    if (match !== undefined)
                        reduce.call(this);
                };
                reduce.call(this);
                return wrapper.done.apply(this, parameters);
            };
        }
    },
    ArrayRequired: InvalidConfiguration.extend({
        message: "Array required."
    }),
    PreprocessorRequired: InvalidConfiguration.extend({
        message: "Function required as preprocessor."
    }),
    FunctionRequired: InvalidConfiguration.extend({
        message: "Function required."
    }),
    AlgorithmRequired: InvalidConfiguration.extend({
        message: "Function required."
    }),
    PropertiesRequired: InvalidConfiguration.extend({
        message: "Native Object instance required."
    }),
    InvalidAlgorithm: InvalidConfiguration.extend({
        message: "Invalid algorithm given."
    }),
    InvalidPreprocessor: InvalidResult.extend({
        message: "Preprocessor must return Array as result."
    })
});

UserError.prototype.merge = new Wrapper({
    algorithm: Wrapper.algorithm.firstMatch,
    preprocessors: [
        function (message) {
            if (typeof (message) == "string")
                return [{message: message}];
        }
    ],
    done: UserError.prototype.merge
}).toFunction();

var StackStringParser = Base.extend({
    messageFinder: /^[^\n]*\n/,
    inheritanceRelatedFramesFinder: /^[\s\S]*?\s+new\s+[^\n]+\n/,
    parse: function (string) {
        if (typeof (string) != "string")
            throw new StackStringParser.StackStringRequired();
        var rawFramesString = this.removeMessage(string);
        var framesString = this.removeInheritanceRelatedFrames(rawFramesString);
        var frames = this.parseFramesString(framesString);
        return new StackTrace({
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
    StackStringRequired: InvalidArguments.extend({
        message: "Stack string required."
    }),
    UnknownFrameFormat: InvalidArguments.extend({
        message: "Unknown frame format."
    })
});

var HashSet = Base.extend({
    items: {},
    init: function () {
        this.build();
        this.configure.apply(this, arguments);
    },
    build: function () {
        Base.prototype.build.call(this);
        var inheritedItems = this.toArray();
        this.items = {};
        if (inheritedItems.length)
            this.addAll.apply(this, inheritedItems);
    },
    configure: function (item) {
        this.addAll.apply(this, arguments);
    },
    addAll: function (item) {
        for (var index in arguments)
            this.add(arguments[index]);
        return this;
    },
    add: function (item) {
        if (!arguments.length)
            return this;
        if (arguments.length > 1)
            return this.addAll.apply(this, arguments);
        if (!(item instanceof Object) || item.id === undefined)
            throw new HashSet.ItemRequired();
        this.items[item.id] = item;
        return this;
    },
    removeAll: function (item) {
        for (var index in arguments)
            this.remove(arguments[index]);
        return this;
    },
    remove: function (item) {
        if (!arguments.length)
            return this;
        if (arguments.length > 1)
            return this.removeAll.apply(this, arguments);
        if (!(item instanceof Object) || item.id === undefined)
            throw new HashSet.ItemRequired();
        delete(this.items[item.id]);
        return this;
    },
    clear: function () {
        for (var id in this.items)
            this.remove(this.items[id]);
        return this;
    },
    containsAll: function (item) {
        var result = true;
        for (var index in arguments)
            if (!this.contains(arguments[index]))
                result = false;
        return result;
    },
    contains: function (item) {
        if (arguments.length != 1)
            return this.containsAll.apply(this, arguments);
        if (!(item instanceof Object) || item.id === undefined)
            throw new HashSet.ItemRequired();
        return this.items[item.id] === item;
    },
    toArray: function () {
        var result = [];
        for (var id in this.items)
            result.push(this.items[id]);
        return result;
    }
}, {
    ItemRequired: InvalidArguments.extend({
        message: "Item with id is required."
    })
});

module.exports = {
    id: id,
    watch: watch,
    unwatch: unwatch,
    extend: extend,
    clone: clone,
    merge: merge,
    shallowCopy: shallowCopy,
    Base: Base,
    HashSet: HashSet,
    UserError: UserError,
    CompositeError: CompositeError,
    InvalidConfiguration: InvalidConfiguration,
    InvalidArguments: InvalidArguments,
    InvalidResult: InvalidResult,
    StackStringParser: StackStringParser,
    StackTrace: StackTrace,
    StackFrame: StackFrame,
    Plugin: Plugin,
    Wrapper: Wrapper
};

