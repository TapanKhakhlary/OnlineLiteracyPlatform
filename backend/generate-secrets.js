const crypto = require('crypto');
console.log('JWT_SECRET=', crypto.randomBytes(64).toString('hex'));
console.log('COOKIE_SECRET=', crypto.randomBytes(64).toString('hex'));