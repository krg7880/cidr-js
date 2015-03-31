'use strict';

var php = require('phpjs');
var ip2long = php.ip2long;
var long2ip = php.long2ip;
var math = Math;
var Calculator = require( 'ip-subnet-calculator' );

var CIDR = function CIDR() {};

/**
 * Parses the given IP to get the
 * last 8 bytes for testing if
 * the IPs are contigous
 * @param ip
 * @returns {Object}
 */
var parse = function(ip) {
    var tmp = ip.split('.')

    return {
        ip: ip,
        decimal: Calculator.toDecimal(ip),
        key: tmp.splice(0, 3).join('')
    };
};

/**
 * Finds the appropriate block or
 * bucket for the given IP to be
 * inserted in. Another way
 * @param key
 * @param ip
 */
var block = function(collection, key, ip) {
    if (!collection) {
        collection = {};
    }

    if (!collection[key]) {
        collection[key] = [];
    }

    collection[key].push(ip);
};

/**
 * Convert the IP to a
 * string of numbers.
 *
 * @param ip
 * @returns {string}
 */
var hash = function(ip) {
    return ip.split('.').join('');
};

/**
 * Returns the IP range (start & end)
 * for a given IP/CIDR
 * @param ip
 * @returns {Object}
 */
CIDR.prototype.range = function(ip) {
    if (!(ip.indexOf('/') > -1)) {
        return null;
    }

    var range = {};
    var parts = ip.split('/');

    if ((parts[1] > 32)) {
        return null;
    }

    range.start = long2ip((ip2long(parts[0])) & ((-1 << (32 - +parts[1]))));
    range.end = long2ip((ip2long(parts[0])) + math.pow(2, (32 - +parts[1])) - 1);

    return range;
};

/**
 * Returns a contiguous list of
 * ips within the range of a
 * given cidr block.
 *
 * @param ip
 * @return {Array}
 */
CIDR.prototype.list = function(ip) {
    if (typeof (ip) === 'undefined') {
        return null;
    }

    var range = this.range(ip);

    if (!range) {
        return null;
    }

    var _ip2long = ip2long;
    var _long2ip = long2ip;
    var list = [];
    var index = 0;
    var startLong = _ip2long(range.start);
    var endLong = _ip2long(range.end);

    list[index++] = range.start;

    while((startLong++ < endLong)) {
        list[index++] = _long2ip(startLong);
    }

    return list;
};

/**
 * Filter the array by grouping
 * IPs where all 32 bits are contiguous
 * 127.0.0.0, 127.0.0.1, 127.0.0.2, etc
 * @returns {Array}
 */
CIDR.prototype.filter = function(ips) {
    if (!(ips instanceof Array) || ips.length <= 0) {
        return null;
    }

    var results = {};

    if (ips.length === 1) {
        return block(results, hash(ips[0]), ips[0]);
    }

    var previous = parse(ips.shift());

    block(results, previous.key, previous.ip);

    var len = ips.length;

    for (var i=0; i<len; i++) {
        var current = parse(ips[i]);

        if ((current.decimal - previous.decimal) === 1) {
            block(results, current.key, ips[i]);
        } else if (ips[(i+1)]) {

            var next = parse(ips[(i+1)]);
            if ((next.decimal - current.decimal) === 1) {

                block(results, current.key, ips[i]);
            } else {

                block(results, hash(current.ip), current.ip);
            }
        } else {

            block(results, hash(current.ip), current.ip);
        }

        previous = current;
    }

    return results;
};

/**
 * Returns arrays grouped
 * contiguously.
 *
 * @returns {Array}
 */
CIDR.prototype.getBlocks = function(ips) {
    var blocks = this.filter(ips);
    var results = [];

    for (var i in blocks) {
        var block = blocks[i];

        if (block.length === 1) {
            results.push(block[0]);
            continue;
        }

        var start = block.shift();
        var end = block.pop();
        var ranges = Calculator.calculate(start, end);

        for (var j in ranges) {
            results.push(ranges[j].ipLowStr + '/' + ranges[j].prefixSize);
        }
    }

    return results;
};

module.exports = CIDR;