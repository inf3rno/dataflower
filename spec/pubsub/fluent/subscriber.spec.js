var ps = require("dataflower/pubsub"),
    psf = require("dataflower/pubsub.fluent"),
    Subscriber = ps.Subscriber,
    subscriber = psf.subscriber;

describe("pubsub.fluent", function () {

    describe("subscriber", function () {

        it("returns a Subscriber instance using Subscriber.instance", function () {

            var wrapper = subscriber(function () {
            });
            expect(wrapper.component instanceof Subscriber).toBe(true);

        });

    });

});
