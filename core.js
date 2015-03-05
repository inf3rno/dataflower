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
    var Descendant = function (source) {
        Object.defineProperty(this, "id", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: id()
        });
        if (this.prepare instanceof Function)
            this.prepare();
        var parameters = [this];
        parameters.push.apply(parameters, arguments);
        mixin.apply(null, parameters);
        if (this.init instanceof Function)
            this.init();
    };
    Descendant.prototype = clone(Ancestor.prototype);
    if (properties)
        mixin(Descendant.prototype, properties);
    Descendant.prototype.constructor = Descendant;
    mixin(Descendant, Ancestor);
    if (staticProperties)
        mixin(Descendant, staticProperties);
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

var mixin = function (subject, source) {
    if (!(subject instanceof Object))
        throw new InvalidArguments();
    if (subject.mixin instanceof Function)
        return subject.mixin.apply(subject, Array.prototype.slice.call(arguments, 1));
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
    clone: function () {
        var instance = Object.create(this);
        if (instance.prepare instanceof Function)
            instance.prepare();
        return instance;
    }
}, {
    extend: function (properties, staticProperties) {
        return extend(this, properties, staticProperties);
    },
    mixin: function (source) {
        var parameters = [this];
        parameters.push.apply(parameters, arguments);
        return shallowCopy.apply(null, parameters);
    }
});
Base.prototype.mixin = Base.mixin;

var UserError = extend(Error, {
    name: "UserError",
    message: "",
    stackTrace: undefined,
    mixin: Base.prototype.mixin,
    init: function () {
        var nativeError = new Error();
        this.stackTrace = new StackTrace({
            string: nativeError.stack || nativeError.stacktrace || ""
        });
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
    extend: Base.extend,
    mixin: Base.mixin
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
    prepare: function () {
        this.frames = clone(this.frames);
    },
    mixin: function (source) {
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
    init: function () {
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
    init: function () {
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
    prepare: function () {
        this.preprocessors = clone(this.preprocessors);
        this.properties = clone(this.properties);
    },
    mixin: function (source) {
        var sources = [];
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

UserError.prototype.mixin = new Wrapper({
    algorithm: Wrapper.algorithm.firstMatch,
    preprocessors: [
        function (message) {
            if (typeof (message) == "string")
                return [{message: message}];
        }
    ],
    done: UserError.prototype.mixin
}).toFunction();

StackTrace.prototype.mixin = new Wrapper({
    algorithm: Wrapper.algorithm.firstMatch,
    done: StackTrace.prototype.mixin
}).toFunction();

module.exports = {
    id: id,
    watch: watch,
    unwatch: unwatch,
    extend: extend,
    clone: clone,
    mixin: mixin,
    shallowCopy: shallowCopy,
    Base: Base,
    UserError: UserError,
    CompositeError: CompositeError,
    InvalidConfiguration: InvalidConfiguration,
    InvalidArguments: InvalidArguments,
    InvalidResult: InvalidResult,
    StackTrace: StackTrace,
    StackFrame: StackFrame,
    Plugin: Plugin,
    Wrapper: Wrapper
};

