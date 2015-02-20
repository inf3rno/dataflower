var last = 0;
var id = function () {
    return ++last;
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
    if (!(subject instanceof Object) || subject === null)
        throw new InvalidArguments();
    if (subject.mixin instanceof Function)
        return subject.mixin.apply(subject, Array.prototype.slice.call(arguments, 1));
    return shallowCopy.apply(null, arguments);
};

var shallowCopy = function (subject, source) {
    if (!(subject instanceof Object) || subject === null)
        throw new InvalidArguments();
    var sources = Array.prototype.slice.call(arguments, 1);
    for (var index = 0, length = sources.length; index < length; ++index) {
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
        return Object.create(this);
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
    name: "Error",
    message: "",
    mixin: Base.prototype.mixin,
    init: function () {
        var nativeError = new Error();
        var stack;
        Object.defineProperty(this, "stack", {
            configurable: false,
            enumerable: false,
            get: function () {
                if (stack === undefined) {
                    stack = "";
                    stack += this.name + " " + this.message + "\n";
                    stack += this.createStack({
                        string: nativeError.stack || nativeError.stacktrace || ""
                    });
                    delete(nativeError);
                }
                return stack;
            }.bind(this)
        });
    },
    createStack: function (options) {
        return new Stack(options);
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

var Stack = Base.extend({
    frames: [],
    string: undefined,
    init: function () {
        if (!(this.frames instanceof Array))
            throw new Stack.FramesRequired();
        for (var index = 0, length = this.frames.length; index < length; ++index) {
            var frame = this.frames[index];
            if (!(frame instanceof Frame))
                throw new Stack.FramesRequired();
        }
    },
    toString: function () {
        if (this.string === undefined)
            this.string = this.frames.join("\n");
        return this.string;
    }
}, {
    FramesRequired: InvalidConfiguration.extend({
        message: "An array of frames is required."
    })
});

var Frame = Base.extend({
    description: undefined,
    path: undefined,
    row: undefined,
    col: undefined,
    string: undefined,
    init: function () {
        if (typeof (this.description) != "string")
            throw new Frame.DescriptionRequired();
        if (typeof (this.path) != "string")
            throw new Frame.PathRequired();
        if (isNaN(this.row))
            throw new Frame.RowRequired();
        if (isNaN(this.col))
            throw new Frame.ColRequired();
    },
    toString: function () {
        if (this.string !== undefined)
            return this.string;
        this.string = "at " + this.description + " (" + this.path + ":" + this.row + ":" + this.col + ")";
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
        for (var index = 0, length = arguments.length; index < length; ++index) {
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
    algorithm: function (options) {
        return function () {
            return options.done.apply(this, arguments);
        };
    },
    properties: {},
    mixin: function (source) {
        if (!this.hasOwnProperty("preprocessors"))
            this.preprocessors = clone(this.preprocessors) || [];
        if (!this.hasOwnProperty("properties"))
            this.properties = clone(this.properties) || {};
        var sources = [];
        for (var sourceIndex = 0, sourceCount = arguments.length; sourceIndex < sourceCount; ++sourceIndex) {
            source = arguments[sourceIndex];
            if (source === undefined || source === null)
                continue;
            if (!(source instanceof Object))
                throw new InvalidArguments();

            if (source.preprocessors !== undefined) {
                if (!(source.preprocessors instanceof Array))
                    throw new Wrapper.ArrayRequired();
                for (var preprocessorIndex = 0, preprocessorCount = source.preprocessors.length; preprocessorIndex < preprocessorCount; ++preprocessorIndex)
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
    wrap: function (source) {
        var options = {
            mixin: this.mixin
        };
        options.mixin({
            preprocessors: this.preprocessors,
            done: this.done,
            algorithm: this.algorithm,
            properties: this.properties
        });
        options.mixin.apply(options, arguments);
        var wrapper = options.algorithm(options);
        if (!(wrapper instanceof Function))
            throw new Wrapper.InvalidAlgorithm();
        shallowCopy(wrapper,
            {
                wrapper: this,
                options: options
            },
            options.properties
        );
        return wrapper;
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
        cascade: function (options) {
            return function () {
                var parameters = Array.prototype.slice.apply(arguments);
                for (var index = 0, length = options.preprocessors.length; index < length; ++index) {
                    var preprocessor = options.preprocessors[index];
                    parameters = preprocessor.apply(this, parameters);
                }
                return options.done.apply(this, parameters);
            };
        },
        firstMatch: function (options) {
            return function () {
                var parameters = arguments,
                    match;
                for (var index = 0, length = options.preprocessors.length; index < length; ++index) {
                    var preprocessor = options.preprocessors[index];
                    match = preprocessor.apply(this, arguments);
                    if (match !== undefined) {
                        parameters = match;
                        break;
                    }
                }
                return options.done.apply(this, parameters);
            };
        },
        firstMatchCascade: function (options) {
            return function () {
                var parameters = arguments;
                var reduce = function () {
                    var match;
                    for (var index = 0, length = options.preprocessors.length; index < length; ++index) {
                        var preprocessor = options.preprocessors[index];
                        match = preprocessor.apply(this, parameters);
                        if (match !== undefined) {
                            parameters = match;
                            break;
                        }
                    }
                    if (match !== undefined)
                        reduce.call(this);
                };
                reduce.call(this);
                return options.done.apply(this, parameters);
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
    })
});

UserError.prototype.createStack = new Wrapper({
    algorithm: Wrapper.algorithm.firstMatch,
    done: UserError.prototype.createStack
}).wrap();

UserError.prototype.mixin = new Wrapper({
    algorithm: Wrapper.algorithm.firstMatch,
    preprocessors: [
        function (message) {
            if (typeof (message) == "string")
                return {message: message};
        }
    ],
    done: UserError.prototype.mixin
}).wrap();

module.exports = {
    id: id,
    extend: extend,
    clone: clone,
    mixin: mixin,
    shallowCopy: shallowCopy,
    Base: Base,
    UserError: UserError,
    InvalidConfiguration: InvalidConfiguration,
    InvalidArguments: InvalidArguments,
    Stack: Stack,
    Frame: Frame,
    Plugin: Plugin,
    Wrapper: Wrapper
};

