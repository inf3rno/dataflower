var df = require("dataflower"),
    HashSet = df.HashSet,
    Base = df.Base,
    InvalidArguments = df.InvalidArguments,
    toArray = df.toArray;

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
                            log("build", this, toArray(arguments));
                        },
                        merge: function (a, b) {
                            log("merge", this, toArray(arguments));
                        },
                        configure: function () {
                            log("configure", this, toArray(arguments));
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

            describe("addAll", function () {

                it("calls add with each of the items", function () {

                    var Descendant = HashSet.extend({
                        add: jasmine.createSpy()
                    });
                    var descendant = new Descendant();
                    expect(descendant.add).not.toHaveBeenCalled();
                    descendant.addAll(1, 2, 3);
                    expect(descendant.add).toHaveBeenCalledWith(1);
                    expect(descendant.add).toHaveBeenCalledWith(2);
                    expect(descendant.add).toHaveBeenCalledWith(3);
                    expect(descendant.add.calls.count()).toBe(3);
                });

            });

            describe("add", function () {

                it("calls hashCode to check the arguments and get the id", function () {

                    var hashSet = new HashSet();
                    var log = spyOn(hashSet, "hashCode");
                    var item = {id: 1};
                    hashSet.add(item);
                    expect(log).toHaveBeenCalledWith(item);
                });

                it("adds the item to the items object with the id as key", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.add(o);
                    hashSet.add(o2);
                    expect(hashSet.items[o.id]).toBe(o);
                    expect(hashSet.items[o2.id]).toBe(o2);
                });

            });

            describe("removeAll", function () {

                it("calls remove with each of the items", function () {

                    var Descendant = HashSet.extend({
                        remove: jasmine.createSpy()
                    });
                    var descendant = new Descendant();
                    expect(descendant.remove).not.toHaveBeenCalled();
                    descendant.removeAll(1, 2, 3);
                    expect(descendant.remove).toHaveBeenCalledWith(1);
                    expect(descendant.remove).toHaveBeenCalledWith(2);
                    expect(descendant.remove).toHaveBeenCalledWith(3);
                    expect(descendant.remove.calls.count()).toBe(3);
                });

            });

            describe("remove", function () {

                it("calls hashCode to check the arguments and get the id", function () {

                    var hashSet = new HashSet();
                    var log = spyOn(hashSet, "hashCode");
                    var item = {id: 1};
                    hashSet.remove(item);
                    expect(log).toHaveBeenCalledWith(item);
                });

                it("removes the item from the items object if it was added previously", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.addAll(o, o2);
                    hashSet.remove(o2);

                    expect(hashSet.items[o.id]).toBe(o);
                    expect(hashSet.items[o2.id]).not.toBeDefined();
                });

            });

            describe("clear", function () {

                it("removes all of the items from HashSet", function () {

                    var Descendant = HashSet.extend({
                        remove: jasmine.createSpy()
                    });
                    var descendant = new Descendant();
                    var o = new Base(),
                        o2 = new Base();
                    descendant.addAll(o, o2);
                    descendant.clear();

                    expect(descendant.remove).toHaveBeenCalledWith(o);
                    expect(descendant.remove).toHaveBeenCalledWith(o2);
                    expect(descendant.remove.calls.count()).toBe(2);
                });

            });

            describe("containsAll", function () {

                it("calls contains with each of the items", function () {

                    var Descendant = HashSet.extend({
                        contains: jasmine.createSpy()
                    });
                    var descendant = new Descendant();
                    expect(descendant.contains).not.toHaveBeenCalled();
                    descendant.containsAll(1, 2, 3);
                    expect(descendant.contains).toHaveBeenCalledWith(1);
                    expect(descendant.contains).toHaveBeenCalledWith(2);
                    expect(descendant.contains).toHaveBeenCalledWith(3);
                    expect(descendant.contains.calls.count()).toBe(3);
                });

                it("aggregates the results", function () {
                    var result;
                    var Descendant = HashSet.extend({
                        contains: jasmine.createSpy().and.callFake(function () {
                            return result;
                        })
                    });
                    var descendant = new Descendant();
                    expect(descendant.containsAll()).toBe(true);
                    expect(descendant.contains.calls.count()).toBe(0);
                    result = false;
                    expect(descendant.containsAll(1, 2, 3)).toBe(false);
                    expect(descendant.contains.calls.count()).toBe(3);
                    descendant.contains.calls.reset();
                    result = true;
                    expect(descendant.containsAll(1, 2, 3)).toBe(true);
                    expect(descendant.contains.calls.count()).toBe(3);
                });

            });

            describe("contains", function () {

                it("calls hashCode to check the arguments and get the id", function () {

                    var hashSet = new HashSet();
                    var log = spyOn(hashSet, "hashCode");
                    var item = {id: 1};
                    hashSet.contains(item);
                    expect(log).toHaveBeenCalledWith(item);
                });

                it("returns true if the item is contained by the HashSet", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.addAll(o, o2);
                    expect(hashSet.contains(o)).toBe(true);
                    expect(hashSet.contains(o2)).toBe(true);
                    hashSet.remove(o2);
                    expect(hashSet.contains(o)).toBe(true);
                    expect(hashSet.contains(o2)).toBe(false);
                });

            });

            describe("hashCode", function () {


                it("accepts only objects with id property as items", function () {

                    expect(function () {
                        var hashSet = new HashSet();
                        hashSet.hashCode({id: 1});
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
                                hashSet.hashCode(item);
                            }).toThrow(new HashSet.ItemRequired());
                        });
                });

                it("does not accept zero or multiple arguments", function () {

                    var hashSet = new HashSet();

                    expect(function () {
                        hashSet.hashCode({id: 1}, {id: 2});
                    }).toThrow(new InvalidArguments());

                    expect(function () {
                        hashSet.hashCode();
                    }).toThrow(new InvalidArguments.Empty());

                });

                it("returns the id of the item", function () {

                    var hashSet = new HashSet();
                    var id = hashSet.hashCode({id: 123});
                    expect(id).toBe(123);
                });

            });

            describe("toArray", function () {

                it("returns an Array of the contained items", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.addAll(o, o2);
                    var a = hashSet.toArray();
                    expect(a).toEqual([o, o2]);
                });

            });

            describe("clone", function () {

                it("returns a new HashSet which contains the same items", function () {

                    var hashSet = new HashSet();
                    var o = new Base(),
                        o2 = new Base();
                    hashSet.addAll(o, o2);
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