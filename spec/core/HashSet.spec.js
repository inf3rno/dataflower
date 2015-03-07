var df = require("dataflower"),
    HashSet = df.HashSet,
    Base = df.Base,
    InvalidArguments = df.InvalidArguments;

describe("core", function () {

    describe("HashSet", function () {

        it("is a Base descendant", function () {

            expect(HashSet.prototype instanceof Base).toBe(true);
        });

        describe("prototype", function () {

            describe("init", function () {

                it("sets unique id automatically", function () {

                    var hashSet = new HashSet();
                    expect(hashSet.id).toBeDefined();
                    expect(hashSet.id).not.toBe(new HashSet().id);
                });

                it("calls build and configure in this order, but not merge", function () {

                    var log = jasmine.createSpy();
                    var Descendant = HashSet.extend({
                        build: function () {
                            expect(this.id).toBeDefined();
                            log("build", this, Array.prototype.slice.call(arguments));
                        },
                        merge: function (a, b) {
                            log("merge", this, Array.prototype.slice.call(arguments));
                        },
                        configure: function () {
                            log("configure", this, Array.prototype.slice.call(arguments));
                        }
                    });
                    var descendant = new Descendant({a: 1}, {b: 2});
                    expect(log.calls.argsFor(0)).toEqual(["build", descendant, []]);
                    expect(log.calls.argsFor(1)).toEqual(["configure", descendant, [{a: 1}, {b: 2}]]);
                    expect(log.calls.count()).toBe(2);
                });

            });

            describe("configure", function () {

                it("calls addAll with the arguments", function () {

                    var Descendant = HashSet.extend({
                        addAll: jasmine.createSpy()
                    });
                    var descendant = new Descendant(1, 2, 3);
                    expect(descendant.addAll).toHaveBeenCalledWith(1, 2, 3);
                });

            });

            describe("add", function () {

                it("accepts only objects with id property as items", function () {

                    expect(function () {
                        var hashSet = new HashSet();
                        hashSet.add();
                        hashSet.add({id: 1});
                        hashSet.add({id: 2}, {id: 3});
                    }).not.toThrow();

                    [
                        null,
                        undefined,
                        {},
                        function () {
                        },
                        "string",
                        123,
                        false
                    ].forEach(function (item) {
                            expect(function () {
                                var hashSet = new HashSet();
                                hashSet.add(item);
                            }).toThrow(new HashSet.ItemRequired());
                        });

                    expect(function () {
                        var hashSet = new HashSet();
                        hashSet.add({id: 1}, null);
                    }).toThrow(new HashSet.ItemRequired());
                });

                it("adds the items to the items object with the id as key", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.add(o, o2);
                    expect(hashSet.items[o.id]).toBe(o);
                    expect(hashSet.items[o2.id]).toBe(o2);
                });

            });

            describe("remove", function () {

                it("accepts only objects with id property as items", function () {

                    expect(function () {
                        var hashSet = new HashSet();
                        hashSet.remove();
                        hashSet.remove({id: 1});
                        hashSet.remove({id: 2}, {id: 3});
                    }).not.toThrow();

                    [
                        null,
                        undefined,
                        {},
                        function () {
                        },
                        "string",
                        123,
                        false
                    ].forEach(function (item) {
                            expect(function () {
                                var hashSet = new HashSet();
                                hashSet.remove(item);
                            }).toThrow(new HashSet.ItemRequired());
                        });

                    expect(function () {
                        var hashSet = new HashSet();
                        hashSet.remove({id: 1}, null);
                    }).toThrow(new HashSet.ItemRequired());
                });

                it("removes the item from the items object if it was added previously", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.add(o, o2);
                    hashSet.remove(o2);

                    expect(hashSet.items[o.id]).toBe(o);
                    expect(hashSet.items[o2.id]).not.toBeDefined();
                });

            });

            describe("clear", function () {

                it("removes all of the items from HashSet", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.add(o, o2);
                    hashSet.clear();

                    expect(hashSet.items[o.id]).not.toBeDefined();
                    expect(hashSet.items[o2.id]).not.toBeDefined();

                });

            });

            describe("contains", function () {

                it("accepts only objects with id property as items", function () {

                    expect(function () {
                        var hashSet = new HashSet();
                        hashSet.contains();
                        hashSet.contains({id: 1});
                        hashSet.contains({id: 2}, {id: 3});
                    }).not.toThrow();

                    [
                        null,
                        undefined,
                        {},
                        function () {
                        },
                        "string",
                        123,
                        false
                    ].forEach(function (item) {
                            expect(function () {
                                var hashSet = new HashSet();
                                hashSet.contains(item);
                            }).toThrow(new HashSet.ItemRequired());
                        });

                    expect(function () {
                        var hashSet = new HashSet();
                        hashSet.contains({id: 1}, null);
                    }).toThrow(new HashSet.ItemRequired());
                });

                it("returns true if the items are contained by the hashSet", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.add(o, o2);
                    expect(hashSet.contains(o, o2)).toBe(true);
                    hashSet.remove(o2);
                    expect(hashSet.contains(o, o2)).toBe(false);
                    expect(hashSet.contains(o)).toBe(true);
                    expect(hashSet.contains(o2)).toBe(false);
                    expect(hashSet.contains()).toBe(true);
                });

            });

            describe("toArray", function () {

                it("returns an Array of the contained items", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.add(o, o2);
                    var a = hashSet.toArray();
                    expect(a).toEqual([o, o2]);
                });

            });

            describe("clone", function () {

                it("returns a new HashSet which contains the same items", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.add(o, o2);
                    var clone = hashSet.clone();
                    expect(clone instanceof HashSet).toBe(true);
                    expect(clone).not.toBe(hashSet);
                    expect(clone.toArray()).toEqual(hashSet.toArray());
                    expect(clone.id).not.toBe(hashSet.id);

                    hashSet.remove(o2);
                    expect(hashSet.contains(o2)).toBe(false);
                    expect(clone.contains(o2)).toBe(true);
                });

            });

        });

    });

});