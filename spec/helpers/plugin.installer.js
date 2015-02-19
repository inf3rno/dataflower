var ps = require("dataflower/pubsub"),
    psf = require("dataflower/pubsub.fluent"),
    v8 = require("dataflower/error.v8");

ps.install();
psf.install();

if (v8.compatible())
    v8.install();
