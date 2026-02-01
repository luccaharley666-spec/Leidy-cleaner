require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'DEFINED (' + process.env.JWT_SECRET.length + ' chars)' : 'UNDEFINED');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'DEFINED (' + process.env.JWT_REFRESH_SECRET.length + ' chars)' : 'UNDEFINED');
