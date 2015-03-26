var php = require('phpjs');

/**
 * Returns the range or the start and end
 * IPs for a given cidr block.
 *
 * @param cidr
 * @returns {Objects}
 */
exports.range = function(cidr) {
    var range = {};
    var parts = cidr.split('/');
    range.start = php.long2ip((php.ip2long(parts[0])) & ((-1 << (32 - +parts[1]))));
    range.end = php.long2ip((php.ip2long(parts[0])) + php.pow(2, (32 - +parts[1])) - 1);

    return range;
};

/**
 * Returns a contiguous list of ips
 * within a given cidr block.
 * @param cidr
 * @returns {Array}
 */
exports.list = function(cidr) {
    if (typeof (cidr) === 'undefined') {
        return [];
    }

    var list = [];
    var range = exports.range(cidr);
    var startLong = php.ip2long(range.start);
    var endLong = php.ip2long(range.end);

    list.push(range.start);

    while(startLong++ < endLong) {
        list.push(php.long2ip(startLong));
    }
    return list;
};
