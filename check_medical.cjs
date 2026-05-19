const https = require('https');

const url = 'https://api.siputzx.my.id/api/fun/livefunfact?birthdate=1990-05-15';

https.get(url, (res) => {
    console.log('Status:', res.statusCode);

    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Body:', data));

}).on('error', (e) => {
    console.error('Error:', e);
});
