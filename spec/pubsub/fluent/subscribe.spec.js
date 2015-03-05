var ps = require("dataflower/pubsub"),
    psf = require("dataflower/pubsub.fluent"),
    Subscription = ps.Subscription,
    publisher = psf.publisher,
    subscribe = psf.subscribe;

describe("pubsub.fluent", function () {

    describe("subscribe", function () {

        it("returns a Subscription instance using Subscription.instance", function () {

            var subscription = subscribe(publisher(), function () {
            });
            expect(subscription instanceof Subscription).toBe(true);

        });

    });

});
