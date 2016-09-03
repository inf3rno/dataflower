var expect = require("expect.js"),
    df = require("../.."),
    Flow = df.Flow;

module.exports = function () {

    var aFlow;

    this.When(/^I sustain a data flow$/, function (next) {
        aFlow = new Flow();
        aFlow.sustain(12);
        next();
    });

    this.Then(/^I should be able to extract data from it$/, function (next) {
        expect(aFlow.extract()).to.be(12);
        next();
    });


    this.When(/^I have a dry data flow$/, function (next) {
        aFlow = new Flow();
        expect(aFlow.isDry()).to.be(true);
        next();
    });

    this.Then(/^I should not be able to extract data from it$/, function (next) {
        expect(function () {
            aFlow.extract();
        }).to.throwError(function (error) {
            expect(error).to.be.a(Flow.DryExtract);
        });
        next();
    });

    this.When(/^I have a blocked data flow$/, function (next) {
        aFlow = new Flow();
        aFlow.block();
        expect(aFlow.isBlocked()).to.be(true);
        expect(aFlow.isSustainable()).to.be(false);
        next();
    });

    this.Then(/^I should not be able to sustain it$/, function (next) {
        expect(function () {
            aFlow.sustain(1);
        }).to.throwError(function (error) {
            expect(error).to.be.a(Flow.BlockedSustain);
        });
        next();
    });

    this.Then(/^I should not be able to block it again$/, function (next) {
        expect(function () {
            aFlow.block();
        }).to.throwError(function (error) {
            expect(error).to.be.a(Flow.AlreadyBlocked);
        });
        next();
    });

    this.When(/^I have a data flow with some data on it$/, function (next) {
        aFlow = new Flow();
        aFlow.sustain(1, 2, 3, 4);
        next();
    });

    this.Then(/^I should be able to measure the size of this flow$/, function (next) {
        expect(aFlow.size()).to.be(4);
        next();
    });
};