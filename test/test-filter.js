var chai = require('chai');
var expect = chai.expect;
var CIDR = require(__dirname + '/../src/index');
var ips = require(__dirname + '/fixtures/ips');

describe('cidr.filter()', function() {
    it('should filter the ips into contiguous blocks', function(done) {
        var cidr = new CIDR();
        var results = cidr.filter(ips);
        expect(results.hasOwnProperty("12700")).to.equal(true);
        expect(results.hasOwnProperty("12701")).to.equal(true)
        expect(results.hasOwnProperty("127015")).to.equal(true)
        return done();
    });
});