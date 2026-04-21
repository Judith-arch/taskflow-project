const path = require('path');
const result = require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Debug — shows if dotenv found and parsed the file
console.log('dotenv result:', result);
console.log('PORT:', process.env.PORT);

if (!process.env.PORT) {
    // Fallback so the server starts while we debug
    process.env.PORT = '3000';
    console.log('Warning: PORT not found in .env, using fallback 3000');
}

module.exports = {
    PORT: process.env.PORT
};