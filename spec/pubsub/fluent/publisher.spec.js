var ps = require("dataflower/pubsub"),
    psf = require("dataflower/pubsub.fluent"),
    Publisher = ps.Publisher,
    publisher = psf.publisher;

describe("pubsub.fluent", function () {

    describe("publisher", function () {

        it("returns a Publisher instance wrapper using Publisher.instance", function () {

            var wrapper = publisher();
            expect(wrapper.component instanceof Publisher).toBe(true);

        });

    });

});
