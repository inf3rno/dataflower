var df = require("dataflower"),
    ps = require("dataflower/pubsub"),
    ComponentSet = ps.ComponentSet,
    Component = ps.Component,
    Base = df.Base,
    dummy = df.dummy;

describe("pubsub", function () {

    describe("Component.prototype", function () {

        describe("flows", function () {

            it("is a ComponentSet which stores the added items", function () {

                expect(new Component().flows instanceof ComponentSet).toBe(true);
            });

        });

        describe("init", function () {

            it("accepts an Array of Components by merging flows", function () {

                expect(function () {
                    new Component();
                    new Component({
                        flows: []
                    });
                    new Component({
                        flows: [new Component()]
                    });
                    new Component({
                        flows: [
                            new Component(),
                            new Component()
                        ]
                    });
                }).not.toThrow();

                [
                    new Component(),
                    {},
                    "string",
                    123,
                    false,
                    dummy
                ].forEach(function (flows) {
                        expect(function () {
                            new Component({
                                flows: flows
                            });
                        }).toThrow(new Component.ItemsRequired());
                    });
            });

            it("calls addAll if flows given", function () {

                var log = jasmine.createSpy();
                var Descendant = Component.extend({
                    addAll: log
                });
                expect(log).not.toHaveBeenCalled();
                new Descendant();
                expect(log).toHaveBeenCalledWith();
                new Descendant({
                    flows: [1, 2, 3]
                });
                expect(log).toHaveBeenCalledWith(1, 2, 3);
            });

        });

        describe("add", function () {

            it("accepts Components as item", function () {

                expect(function () {
                    var component = new Component();
                    component.add(new Component());
                }).not.toThrow();

                [
                    null,
                    undefined,
                    {},
                    [],
                    "string",
                    123,
                    false,
                    dummy,
                    new Base()
                ].forEach(function (item) {
                        expect(function () {
                            var component = new Component();
                            component.add(item);
                        }).toThrow(new ComponentSet.ComponentRequired());
                    });
            });

            it("adds the item to the component and vice-versa", function () {

                var item = new Component();
                var component = new Component();

                component.add(item);
                expect(component.contains(item)).toBe(true);
                expect(item.contains(component)).toBe(true);
            });

        });

        describe("remove", function () {

            it("accepts Components as item", function () {

                expect(function () {
                    var component = new Component();
                    component.remove(new Component());
                }).not.toThrow();

                [
                    null,
                    undefined,
                    {},
                    [],
                    "string",
                    123,
                    false,
                    dummy,
                    new Base()
                ].forEach(function (item) {
                        expect(function () {
                            var component = new Component();
                            component.remove(item);
                        }).toThrow(new ComponentSet.ComponentRequired());
                    });
            });

            it("removes the subscription from the components", function () {

                var item = new Component();
                var component = new Component();

                component.add(item);
                expect(component.contains(item)).toBe(true);
                expect(item.contains(component)).toBe(true);

                component.remove(item);
                expect(component.contains(item)).toBe(false);
                expect(item.contains(component)).toBe(false);
            });

        });

        describe("toFunction", function () {

            it("returns a wrapper function", function () {

                var component = new Component();
                expect(component.toFunction() instanceof Function).toBe(true);
            });

            it("returns always the same wrapper function", function () {

                var component = new Component();
                expect(component.toFunction()).toBe(component.toFunction());
            });

            describe("wrapper", function () {

                it("calls activate with the parameters and the context", function () {

                    var component = new Component({
                        activate: jasmine.createSpy().and.returnValue(123)
                    });

                    var wrapper = component.toFunction();
                    expect(component.activate).not.toHaveBeenCalled();
                    expect(wrapper(1, 2, 3)).toBe(123);
                    var global = (function () {
                        return this;
                    })();
                    expect(component.activate).toHaveBeenCalledWith([1, 2, 3], global);
                    var o = {
                        m: wrapper
                    };
                    o.m(4, 5, 6);
                    expect(component.activate).toHaveBeenCalledWith([4, 5, 6], o);
                });

                it("has a component property", function () {

                    var component = new Component(),
                        wrapper = component.toFunction();
                    expect(wrapper.component).toBe(component);
                });

                it("adds every sub-component to the wrapper properties as wrapper functions", function () {

                    var component = new Component({
                            x: new Component(),
                            y: new Component()
                        }),
                        wrapper = component.toFunction();
                    expect(wrapper.x).toBe(component.x.toFunction());
                    expect(wrapper.y).toBe(component.y.toFunction());
                });

            });

        });

    });
});