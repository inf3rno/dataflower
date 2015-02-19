var last = 0;
var id = function () {
    return ++last;
};

var mixin = function (subject, source) {
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
        if (this.mixin instanceof Function)
            this.mixin.apply(this, arguments);
        if (this.init instanceof Function)
            this.init();
    };
    Descendant.prototype = Object.create(Ancestor.prototype);
    if (properties)
        mixin(Descendant.prototype, properties);
    Descendant.prototype.constructor = Descendant;
    mixin(Descendant, Ancestor);
    if (staticProperties)
        mixin(Descendant, staticProperties);
    return Descendant;
};

var clone = function (subject) {
    if (!(subject instanceof Object))
        return subject;
    if (subject === null)
        return subject;
    if (subject instanceof Function)
        return subject;
    if (subject instanceof Array)
        return subject.slice();
    if (subject instanceof Date)
        return new Date(subject);
    if (subject instanceof RegExp)
        return new RegExp(subject);
    if (subject.clone instanceof Function)
        return subject.clone();
    if (subject.constructor.clone instanceof Function)
        return subject.constructor.clone(subject);
    return Object.create(subject);
};


var UserError = extend(Error, {
    name: "Error",
    message: "",
    mixin: function (source) {
        var parameters = [this];
        parameters.push.apply(parameters, arguments);
        return mixin.apply(null, parameters);
    },
    clone: function () {
        return this;
    },
    init: function () {
        var nativeError = new Error();
        var stack;
        Object.defineProperty(this, "stack", {
            configurable: false,
            enumerable: true,
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
    extend: function (properties, staticProperties) {
        return extend(this, properties, staticProperties);
    },
    mixin: function (source) {
        var parameters = [this];
        parameters.push.apply(parameters, arguments);
        return mixin.apply(null, parameters);
    },
    clone: function (instance) {
        if (!(instance instanceof UserError))
            throw new InvalidArguments();
        return instance.clone();
    }
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


var Base = extend(Object, {
    mixin: UserError.mixin,
    clone: function () {
        return Object.create(this);
    }
}, {
    extend: UserError.extend,
    mixin: UserError.mixin,
    clone: function (instance) {
        if (!(instance instanceof Base))
            throw new InvalidArguments();
        return instance.clone();
    }
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
    init: function () {
        if (!(this.preprocessors instanceof Array))
            throw new Wrapper.ArrayRequired();
        for (var index = 0, length = this.preprocessors.length; index < length; ++index) {
            var preprocessor = this.preprocessors[index];
            if (!(preprocessor instanceof Function))
                throw new Wrapper.PreprocessorRequired();
        }
        if (!(this.done instanceof Function))
            throw new Wrapper.FunctionRequired();
        if (!(this.algorithm instanceof Function))
            throw new Wrapper.LogicRequired();
        if (!(this.properties instanceof Object))
            throw new Wrapper.PropertiesRequired();
    },
    wrap: function (options) {
        if (arguments.length > 1)
            throw new InvalidArguments();
        if (arguments.length == 1 && !(options instanceof Object))
            throw new InvalidArguments();
        options = this.mergeOptions(options || {});
        var wrapper = options.algorithm(options);
        if (!(wrapper instanceof Function))
            throw new Wrapper.InvalidLogic();
        mixin(wrapper, options.properties);
        wrapper.wrapper = this;
        wrapper.options = options;
        return wrapper;
    },
    mergeOptions: function (options) {
        if (arguments.length != 1 || !(options instanceof Object))
            throw new InvalidArguments();

        var preprocessors = [];
        preprocessors.push.apply(preprocessors, this.preprocessors);
        if (options.preprocessors !== undefined && !(options.preprocessors instanceof Array))
            throw new Wrapper.ArrayRequired();
        if (options.preprocessors) {
            for (var index = 0, length = options.preprocessors.length; index < length; ++index)
                if (!(options.preprocessors[index] instanceof Function))
                    throw new Wrapper.PreprocessorRequired();
            preprocessors.push.apply(preprocessors, options.preprocessors);
        }

        var done = this.done;
        if (options.done !== undefined && !(options.done instanceof Function))
            throw new Wrapper.FunctionRequired();
        if (options.done)
            done = options.done;

        var algorithm = this.algorithm;
        if (options.algorithm !== undefined && !(options.algorithm instanceof Function))
            throw new Wrapper.LogicRequired();
        if (options.algorithm)
            algorithm = options.algorithm;

        var properties = {};
        mixin(properties, this.properties);
        if (options.properties !== undefined && !(options.properties instanceof Object))
            throw new Wrapper.PropertiesRequired();
        if (options.properties)
            mixin(properties, options.properties);

        var merged = {};
        merged.preprocessors = preprocessors;
        merged.done = done;
        merged.algorithm = algorithm;
        merged.properties = properties;

        return merged;
    }
}, {
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
    LogicRequired: InvalidConfiguration.extend({
        message: "Function required."
    }),
    PropertiesRequired: InvalidConfiguration.extend({
        message: "Native Object instance required."
    }),
    InvalidLogic: InvalidConfiguration.extend({
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
    mixin: mixin,
    extend: extend,
    clone: clone,
    Base: Base,
    UserError: UserError,
    InvalidConfiguration: InvalidConfiguration,
    InvalidArguments: InvalidArguments,
    Stack: Stack,
    Frame: Frame,
    Plugin: Plugin,
    Wrapper: Wrapper
};

