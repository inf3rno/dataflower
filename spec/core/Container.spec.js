var df = require("dflo2");

describe("core", function () {

    var Container = df.Container;
    var Factory = df.Factory;
    var Object = df.Base;

    describe("Container", function () {

        describe("init", function () {

            it("accepts configuration options", function () {

                var o = {
                    x: {}
                };
                var container = new Container(o);
                expect(container.x).toBe(o.x);
            });

        });

        describe("add", function () {

            it("accepts only Factory relatives", function () {

                var container = new Container();

                expect(function () {
                    container.add(Object.extend());
                }).toThrow(new Container.FactoryRequired());

                expect(function () {
                    container.add(new Factory());
                }).not.toThrow();

                expect(function () {
                    container.add(Factory.extend().instance());
                }).not.toThrow();

            });

            it("can be used to add Factory relatives, which are called by Container.instance", function () {

                var container = new Container();
                var A = Factory.extend({
                    create: jasmine.createSpy()
                });
                var B = Factory.extend({
                    create: jasmine.createSpy()
                });
                var a = new A();
                var b = new B();
                container.add(a, false);
                container.add({
                    factory: b,
                    default: false
                });
                var instance = container.create(1, 2, 3);
                expect(a.create).toHaveBeenCalledWith(1, 2, 3);
                expect(b.create).toHaveBeenCalledWith(1, 2, 3);
            });

        });

        describe("create", function () {

            it("returns undefined by default", function () {

                var container = new Container({});
                var instance = container.create(1, 2, 3);
                expect(instance).toBeUndefined();

            });

            it("returns the instance created by the registered Factory", function () {

                var container = new Container();
                var CustomFactory = Factory.extend({
                    create: function (a, b, c) {
                        return {a: a, b: b, c: c};
                    }
                });
                container.add(new CustomFactory());
                var instance = container.create(1, 2, 3);
                expect(instance).toEqual({a: 1, b: 2, c: 3});
            });

            it("returns the instance created by the first registered Factory", function () {

                var container = new Container();
                var FirstFactory = Factory.extend({
                    create: function (a, b, c) {
                        return {a: a, b: b, c: c};
                    }
                });
                var SecondFactory = Factory.extend({
                    create: function (a, b, c) {
                        return [a, b, c];
                    }
                });
                container.add(new FirstFactory());
                container.add(new SecondFactory());
                var instance = container.create(1, 2, 3);
                expect(instance).toEqual({a: 1, b: 2, c: 3});

            });

            it("returns the instance of the second registered Factory only if the first returns undefined", function () {

                var container = new Container();
                var FirstFactory = Factory.extend({
                    create: function (a, b, c) {
                        return;
                    }
                });
                var SecondFactory = Factory.extend({
                    create: function (a, b, c) {
                        return [a, b, c];
                    }
                });
                container.add(new FirstFactory());
                container.add(new SecondFactory());
                var instance = container.create(1, 2, 3);
                expect(instance).toEqual([1, 2, 3]);

            });


            it("calls defaults only if every regular Factory returns undefined", function () {

                var log = jasmine.createSpy();
                var container = new Container();
                container.add({
                    factory: Factory.extend({
                        create: function () {
                            return 1;
                        }
                    }).instance(),
                    isDefault: true
                });
                container.add(Factory.extend({
                    create: function () {
                        return 2;
                    }
                }).instance(), true);
                container.add(Factory.extend({
                    create: function () {
                        return 3;
                    }
                }).instance());
                var instance = container.create();
                expect(instance).toBe(3);
            });
        });

        describe("wrap", function () {

            it("returns a wrapper function", function () {

                var container = new Container();
                var wrapper = container.wrap();

                expect(wrapper instanceof Function);
                expect(wrapper.container).toBe(container);

            });

            it("calls instance with the arguments when the wrapper function is called", function () {

                var log = jasmine.createSpy();
                var container = new Container();
                container.add(Factory.extend({
                    create: log
                }).instance());
                container.add(Factory.extend({
                    create: function (a, b, c) {
                        return {a: a, b: b, c: c};
                    }
                }).instance());
                var wrapper = container.wrap();

                expect(log).not.toHaveBeenCalled();
                var instance = wrapper(1, 2, 3);
                expect(log).toHaveBeenCalledWith(1, 2, 3);
                expect(instance).toEqual({a: 1, b: 2, c: 3});

            });

            it("stores additional parameters and pass them as arguments by the instance call", function () {

                var log = jasmine.createSpy();
                var container = new Container();
                container.add(Factory.extend({
                    create: log
                }).instance());
                var wrapper = container.wrap(1, 2, 3);

                expect(log).not.toHaveBeenCalled();
                var instance = wrapper(4, 5, 6);
                expect(log).toHaveBeenCalledWith(1, 2, 3, 4, 5, 6);

            });

            it("passes the call context, so they container can use it", function () {

                var log = jasmine.createSpy();
                var container = new Container();
                container.add(Factory.extend({
                    create: log
                }).instance());
                var wrapper = container.wrap({
                    pass: [0],
                    passContext: true
                });
                var o1 = {
                    x: wrapper
                };
                var o2 = {
                    x: wrapper
                };

                expect(log).not.toHaveBeenCalled();
                o1.x(1, 2, 3);
                expect(log).toHaveBeenCalledWith(o1, 0, 1, 2, 3);
                o2.x(4, 5, 6);
                expect(log).toHaveBeenCalledWith(o2, 0, 4, 5, 6);

            });

        });

    });
});