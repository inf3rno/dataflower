var last = 0;
var id = function () {
    return ++last;
};

var extend = function (Ancestor, properties, staticProperties) {
    var Descendant = function () {
        if (this.init instanceof Function)
            this.init.apply(this, arguments);
    };
    Descendant.prototype = Object.create(Ancestor.prototype);
    if (properties)
        for (var property in properties)
            Descendant.prototype[property] = properties[property];
    Descendant.prototype.constructor = Descendant;
    for (var staticProperty in Ancestor)
        Descendant[staticProperty] = Ancestor[staticProperty];
    if (staticProperties)
        for (var staticProperty in staticProperties)
            Descendant[staticProperty] = staticProperties[staticProperty];
    return Descendant;
};

var UserError = extend(Error, {
    id: undefined,
    name: "Error",
    message: "",
    configure: function (options, preprocessor) {
        if (!this.isOptions(options))
            return;
        if (options.hasOwnProperty("configure")) {
            this.configure = options.configure;
            return this.configure.apply(this, arguments);
        }
        if (!this.isOptions(preprocessor))
            preprocessor = {};
        for (var property in options) {
            if (property == "init")
                continue;
            var value = options[property];
            if (!preprocessor.hasOwnProperty(property)) {
                this[property] = value;
                continue;
            }
            var transformer = preprocessor[property];
            if (!(transformer instanceof Function))
                throw new Base.FunctionRequired();
            this[property] = transformer(value);
        }
        if (!options.init)
            return;
        this.init = options.init;
        var parameters = [];
        if (preprocessor.hasOwnProperty("init"))
            parameters = preprocessor.init;
        if (!(parameters instanceof Array))
            throw new Base.ArgumentsRequired();
        this.init.apply(this, parameters);
    },
    isOptions: function (options) {
        return !!options && options.constructor === Object;
    },
    init: function (options, preprocessor) {
        this.id = id();
        if (typeof (options) == "string")
            options = {message: options};
        this.configure(options, preprocessor);

        var nativeError = new Error();
        var stack;
        Object.defineProperty(this, "stack", {
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
    instance: function () {
        var instance = Object.create(this.prototype);
        this.apply(instance, arguments);
        return instance;
    },
    extend: function (properties, staticProperties) {
        return extend(this, properties, staticProperties);
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
    configure: UserError.prototype.configure,
    isOptions: UserError.prototype.isOptions
}, {
    instance: UserError.instance,
    extend: UserError.extend,
    clone: function (instance) {
        var Class = instance.constructor;
        if (Class !== Base && (Class.prototype instanceof Base) && Class.clone !== Base.clone)
            return Class.clone(instance);
        return Object.create(instance);
    },
    FunctionRequired: InvalidConfiguration.extend({
        message: "Function required as preprocessor."
    }),
    ArgumentsRequired: InvalidConfiguration.extend({
        message: "Init arguments required as preprocessor parameter."
    })
});

var Stack = Base.extend({
    frames: [],
    string: undefined,
    init: function (options, preprocessor) {
        this.configure(options, preprocessor);
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
    init: function (options, preprocessor) {
        this.configure(options, preprocessor);
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
    init: function (options, preprocessor) {
        this.id = id();
        this.dependencies = {};
        this.configure(options, preprocessor);
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
    },
    properties: {},
    init: function (options) {
        this.configure(options);
        if (!(this.preprocessors instanceof Array))
            throw new Wrapper.ArrayRequired();
        for (var index = 0, length = this.preprocessors.length; index < length; ++index) {
            var preprocessor = this.preprocessors[index];
            if (!(preprocessor instanceof Function))
                throw new Wrapper.PreprocessorRequired();
        }
        if (!(this.done instanceof Function))
            throw new Wrapper.FunctionRequired();
        if (!this.isOptions(this.properties))
            throw new Wrapper.PropertiesRequired();
    },
    wrap: function (options) {
        if (arguments.length > 1)
            throw new InvalidArguments();
        if (arguments.length == 1 && !this.isOptions(options))
            throw new InvalidArguments();

        options = this.mergeOptions(options || {});

        var wrapper = function () {
            var parameters = Array.prototype.slice.apply(arguments);
            for (var index = 0, length = options.preprocessors.length; index < length; ++index) {
                var preprocessor = options.preprocessors[index];
                parameters = preprocessor.apply(this, parameters);
            }
            return options.done.apply(this, parameters);
        };
        for (var property in options.properties)
            wrapper[property] = options.properties[property];
        wrapper.wrapper = this;
        wrapper.options = options;
        return wrapper;
    },
    mergeOptions: function (options) {
        if (arguments.length != 1 || !this.isOptions(options))
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

        var properties = {};
        for (var property in this.properties)
            properties[property] = this.properties[property];
        if (options.properties !== undefined && !this.isOptions(options.properties))
            throw new Wrapper.PropertiesRequired();
        if (options.properties)
            for (var property in options.properties)
                properties[property] = options.properties[property];

        var merged = {};
        for (var property in options)
            merged[property] = options[property];
        merged.preprocessors = preprocessors;
        merged.done = done;
        merged.properties = properties;

        return merged;
    }
}, {
    ArrayRequired: InvalidConfiguration.extend({
        message: "Array required."
    }),
    PreprocessorRequired: InvalidConfiguration.extend({
        message: "Function required as preprocessor."
    }),
    FunctionRequired: InvalidConfiguration.extend({
        message: "Function required."
    }),
    PropertiesRequired: InvalidConfiguration.extend({
        message: "Native Object instance required."
    })
});

UserError.prototype.createStack = new Wrapper({
    done: UserError.prototype.createStack
}).wrap();

module.exports = {
    id: id,
    Base: Base,
    UserError: UserError,
    InvalidConfiguration: InvalidConfiguration,
    InvalidArguments: InvalidArguments,
    Stack: Stack,
    Frame: Frame,
    Plugin: Plugin,
    Wrapper: Wrapper
};

