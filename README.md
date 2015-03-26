# cidr-js
Node module for for expanding cidr blocks in a list of IP (a-z) or just the range (start &amp; end)

## Example Usage
Get just the start and end IPs

```javascript
var cidr = require(__dirname + '/../index');
var block = '127.0.0.0/31';
var results = cidr.range(block);

// should return ['127.0.0.0', '127.0.0.1']
```

Get a list of ips in a given range

```javascript
var cidr = require(__dirname + '/../index');
var block = '127.0.0.0/30';
var results = cidr.list(block);

// should return [ '127.0.0.0', '127.0.0.1', '127.0.0.2', '127.0.0.3' ]
```

## Testing
```bash
npm test
```
