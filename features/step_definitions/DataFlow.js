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
            expect(error).to.be.a(DataFlow.NoDataAvailable);
        });
        next();
    });

};