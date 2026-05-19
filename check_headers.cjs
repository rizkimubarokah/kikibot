
const https = require('https');

const url = 'https://api.siputzx.my.id/api/ai/flux?prompt=hello';

https.get(url, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));
    res.resume();
}).on('error', (e) => {
    console.error('Error:', e);
});
