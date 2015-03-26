var chai = require('chai');
var expect = chai.expect;
var cidr = require(__dirname + '/../index');

describe('CIDR Range', function() {
    it('should return the same start and end range', function() {
        var block = '127.0.0.0/32';
        var results = cidr.range(block);
        expect(results.start).to.equal(results.end);
    });

    it('should return the same two distinct ips', function() {
        var block = '127.0.0.0/31';
        var results = cidr.range(block);
        expect(results.start).to.not.equal(results.end);
        expect(results.start).to.equal('127.0.0.0');
        expect(results.end).to.equal('127.0.0.1');
    });
});

describe('CIDR List', function() {
    it('should return a list of 256 IPs for /24 block', function() {
        var block = '127.0.0.0/24';
        var results = cidr.list(block);
        expect(results.length).to.equal(256);
    });

    it('should return a list of 65, 536 IPs for /16 block', function() {
        var block = '127.0.0.0/16';
        var results = cidr.list(block);
        expect(results.length).to.equal(65536);
    });
});