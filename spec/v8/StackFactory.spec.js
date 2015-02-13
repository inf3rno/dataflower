var NativeObject = Object,
    NativeError = Error,
    df = require("dflo2"),
    v8 = require("dflo2/v8");

describe("v8", function () {

    var StackFactory = v8.StackFactory,
        StackStringParser = v8.StackStringParser,
        Stack = df.Stack;

    describe("StackFactory", function () {

        describe("create", function () {

            it("calls the parser with the stackString of the given nativeError", function () {

                var MockStack = Stack.extend({
                    init: jasmine.createSpy()
                });

                var mockParser = NativeObject.create(StackStringParser.prototype);
                mockParser.parse = jasmine.createSpy();
                mockParser.parse.and.callFake(function (MockStack, stackString) {
                    return new MockStack("parsed", stackString);
                });

                var factory = new StackFactory({
                    parser: mockParser
                });

                var mockNativeError = NativeObject.create(NativeError.prototype);
                mockNativeError.stack = "stackString";

                var mockStack = factory.create(MockStack, mockNativeError);
                expect(mockParser.parse).toHaveBeenCalledWith(MockStack, "stackString");
                expect(mockStack instanceof MockStack).toBe(true);
                expect(mockStack.init).toHaveBeenCalledWith("parsed", "stackString");

            });
        });

    });
});


