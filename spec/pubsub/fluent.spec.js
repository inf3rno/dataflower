/*
 psf need to be installed on ps to pass
 so we are testing integration here and not individual classes
 */

var ps = require("dataflower/pubsub"),
    psf = require("dataflower/pubsub.fluent"),
    Publisher = ps.Publisher,
    Subscriber = ps.Subscriber,
    Subscription = ps.Subscription,
    publisher = psf.publisher,
    subscriber = psf.subscriber,
    subscribe = psf.subscribe;

describe("pubsub.fluent", function () {

    describe("publisher", function () {

        it("returns a Publisher instance wrapper using Publisher.instance", function () {

            var wrapper = publisher();
            expect(wrapper.component instanceof Publisher).toBe(true);

        });

    });

    describe("subscriber", function () {

        it("returns a Subscriber instance using Subscriber.instance", function () {

            var wrapper = subscriber(function () {
            });
            expect(wrapper.component instanceof Subscriber).toBe(true);

        });

    });

    describe("subscribe", function () {

        it("returns a Subscription instance using Subscription.instance", function () {

            var instance = subscribe(publisher(), function () {
            });
            expect(instance instanceof Subscription).toBe(true);

        });

    });

});
