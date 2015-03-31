var Calculator = require( 'ip-subnet-calculator' );

var Subnet = function() {
    this.blocks = {};
    this.ranges = [];
    this.ips = null;
    this.filtered = false;
};

/**
 * Parses the given IP to get the
 * last 8 bytes for testing if
 * the IPs are contigous
 * @param ip
 * @returns {Object}
 */
var parse = function(ip) {
    var tmp = ip.split('.');

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
var block = function(key, ip) {
    if (!this.blocks) {
        this.blocks = {};
    }

    if (!this.blocks[key]) {
        this.blocks[key] = [];
    }

    this.blocks[key].push(ip);
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
 * Filter the array by grouping
 * IPs where all 32 bits are contiguous
 * 127.0.0.0, 127.0.0.1, 127.0.0.2, etc
 * @returns {Subnet}
 */
Subnet.prototype.filter = function(ips) {
    if (ips) {
        this.ips = ips;
    }

    if (!(this.ips instanceof Array) || this.ips.length <= 0) {
        return this;
    }

    var ips = this.ips;

    if (ips.length === 1) {
        block.call(this, hash(ips[0]), ips[0]);
        return this;
    }

    var previous = parse(ips.shift());

    block.call(this, previous.key, previous.ip);

    var len = ips.length;

    for (var i=0; i<len; i++) {
        var current = parse(ips[i]);
        if ((current.decimal - previous.decimal) === 1) {
            block.call(this, current.key, ips[i]);
        } else if (ips[(i+1)]) {
            var next = parse(ips[(i+1)]);
            if ((next.decimal - current.decimal) === 1) {
                block.call(this, current.key, ips[i]);
            } else {
                block.call(this, hash(current.ip), current.ip);
            }
        } else {
            block.call(this, hash(current.ip), current.ip);
        }

        previous = current;
    }

    this.filtered = true;

    return this;
};

/**
 * Returns arrays grouped
 * contiguously.
 *
 * @returns {Array}
 */
Subnet.prototype.getRanges = function(ips) {
    if (ips) {
        this.ips = ips;
    }

    if (this.ranges.length > 0) {
        return this.ranges;
    }

    if (!this.filtered) {
        this.filter();
    }

    for (var i in this.blocks) {
        var block = this.blocks[i];
        if (block.length === 1) {
            this.ranges.push(block[0]);
            continue;
        }
        var start = block.shift();
        var end = block.pop();
        var ranges = Calculator.calculate(start, end);

        for (var j in ranges) {
            this.ranges.push([
                ranges[j].ipLowStr, '/', ranges[j].prefixSize
            ].join(''));
        }
    }

    return this.ranges;
};

var subnet = new Subnet();
