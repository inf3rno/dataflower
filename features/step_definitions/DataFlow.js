var expect = require("expect.js"),
    sinon = require("sinon"),
    df = require("../.."),
    DataFlow = df.DataFlow,
    UserError = require("ezone").UserError;

module.exports = function () {

    var dataFlow,
        dataListener,
        notificationListener;

    this.When(/^I write data on a data flow$/, function (next) {
        dataFlow = new DataFlow();
        dataFlow.write(12);
        next();
    });

    this.Then(/^I should be able to read the data from it$/, function (next) {
        expect(dataFlow.read()).to.be(12);
        next();
    });

    this.When(/^I am waiting for data on a data flow$/, function (next) {
        dataFlow = new DataFlow();
        dataListener = sinon.spy();
        dataFlow.await(dataListener);
        next();
    });

    this.Then(/^I should get the data when it is written$/, function (next) {
        expect(dataListener.called).to.be(false);
        dataFlow.write(34);
        expect(dataListener.calledOnce).to.be(true);
        expect(dataListener.withArgs(34).calledOnce).to.be(true);
        dataFlow.write(56);
        expect(dataListener.calledOnce).to.be(true);
        next();
    });

    this.When(/^I pull data from a data flow$/, function (next) {
        dataFlow = new DataFlow();
        notificationListener = sinon.spy();
        dataFlow.on("pulled", notificationListener);
        expect(notificationListener.called).to.be(false);
        dataListener = sinon.spy();
        dataFlow.pull(dataListener);
        next();
    });

    this.Then(/^that data flow should be notified about the pull$/, function (next) {
        expect(notificationListener.calledOnce).to.be(true);
        next();
    });

    this.When(/^I push data to a data flow$/, function (next) {
        dataFlow = new DataFlow();
        notificationListener = sinon.spy();
        dataFlow.on("pushed", notificationListener);
        expect(notificationListener.called).to.be(false);
        dataFlow.push(12);
        next();
    });

    this.Then(/^that data flow should be notified about the push$/, function (next) {
        expect(notificationListener.calledOnce).to.be(true);
        next();
    });

    this.When(/^I don't write data on a data flow$/, function (next) {
        dataFlow = new DataFlow();
        next();
    });

    this.Then(/^I should not be able to read data from it$/, function (next) {
        expect(function () {
            dataFlow.read();
        }).to.throwError(function (error) {
            expect(error).to.be.a(DataFlow.DryRead);
        });
        next();
    });

    this.When(/^I have an exhausted flow$/, function (next) {
        dataFlow = new DataFlow();
        dataFlow.exhaust();
        next();
    });

    this.Then(/^I should not be able to write on it$/, function (next) {
        expect(function () {
            dataFlow.write(1);
        }).to.throwError(function (error) {
            expect(error).to.be.a(DataFlow.ExhaustedWrite);
        });
        next();
    });

    this.When(/^I have a dry and exhausted flow$/, function (next) {
        dataFlow = new DataFlow();
        dataFlow.exhaust();
        next();
    });

    this.Then(/^I should not be able to await it$/, function (next) {
        expect(function () {
            dataFlow.await(function () {
            });
        }).to.throwError(function (error) {
            expect(error).to.be.a(DataFlow.ExhaustedDryAwait);
        });
        next();
    });

    this.When(/^I have a non-dry but exhausted flow$/, function (next) {
        dataFlow = new DataFlow();
        dataFlow.write(1);
        dataFlow.write(2);
        dataFlow.exhaust();
        next();
    });

    this.Then(/^I should be able to await the rest of the data from it$/, function (next) {
        expect(dataFlow.isExhausted()).to.be(true);
        expect(dataFlow.isDry()).to.be(false);
        expect(function () {
            dataFlow.read();
            dataFlow.await(function () {
            });
        }).to.not.throwError();
        expect(dataFlow.isDry()).to.be(true);
        expect(function () {
            dataFlow.await(function () {
            });
        }).to.throwError(function (error) {
            expect(error).to.be.a(DataFlow.ExhaustedDryAwait);
        });
        next();
    });

    this.When(/^I await data from a flow$/, function (next) {
        dataFlow = new DataFlow();
        dataFlow.await(function () {
        });
        next();
    });

    this.Then(/^I should get an error when it gets dry and exhausted meanwhile$/, function (next) {
        expect(function () {
            dataFlow.exhaust();
        }).to.throwError(function (error) {
            expect(error).to.be.a(DataFlow.ExhaustedDryAwait);
        });
        expect(dataFlow.isExhausted()).to.be(true);
        next();
    });

};