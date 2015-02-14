var ps = require("dflo2/pubsub"),
    psf = require("dflo2/pubsub.fluent"),
    v8 = require("dflo2/error.v8");

ps.install();
psf.install();

if (v8.compatible())
    v8.install();