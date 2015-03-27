var ps = require("dataflower/pubsub"),
    Component = ps.Component,
    ComponentSet = ps.ComponentSet;

describe("pubsub", function () {

    describe("ComponentSet.prototype", function () {

        describe("hashCode", function () {

            it("accepts only Component instances", function () {

                expect(function () {
                    new ComponentSet().hashCode(new Component());
                }).not.toThrow();

                expect(function () {
                    new ComponentSet().hashCode({id: 1}).toThrow(new ComponentSet.ComponentRequired());
                });
            });

            it("returns the id of the Component instance", function () {

                var component = new Component();
                expect(component.id).toBeDefined();
                expect(component.id).toBe(new ComponentSet().hashCode(component));
            });

        });

    });
});