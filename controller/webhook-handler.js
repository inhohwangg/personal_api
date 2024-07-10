const express = require('express');
const bodyParser = require('body-parser')
const crypto = require('crypto');
const {exe} = require('child_process')

const app = express();
const PORT = 3001
const SECRET = 'your_secret'; // GitHub 웹훅 비밀 토큰

app.use(bodyParser.json({
    verify: (req, res, buf, encoding) => {
        const signature = `sha1=${crypto.createHmac('sha1', SECRET).update(buf).digest('hex')}`;
        if (req.headers['x-hub-signature'] !== signature) {
            throw new Error('Invalid signature');
        }
    }
}));

app.post('/payload', (req, res) => {
    const payload = req.body;

    if (payload.ref === 'refs/heads/main') { // 원하는 브랜치인지 확인
        exec('cd /path/to/your/project && git pull && systemctl restart personal-api.service', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });
    }

    res.status(200).json({ status: 'success' });
});

app.use((err, req, res, next) => {
    if (err.message === 'Invalid signature') {
        res.status(401).send('Unauthorized');
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});