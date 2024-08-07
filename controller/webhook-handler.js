const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
const crypto = require('crypto');
const {exec} = require('child_process')

// router.use(bodyParser.json({
//     verify: (req, res, buf, encoding) => {
//         const signature = `sha1=${crypto.createHmac('sha1', SECRET).update(buf).digest('hex')}`;
//         if (req.headers['x-hub-signature'] !== signature) {
//             throw new Error('Invalid signature');
//         }
//     }
// }));

router.post('/payload', (req, res) => {
    const payload = req.body;

    if (payload.ref === 'refs/heads/main') { // 원하는 브랜치인지 확인
        const cmd = 'cd /home/hwanginho/dev/personal_api && git pull && sudo systemctl restart personal-api.service';
        exec(cmd, { env: { ...process.env, HOME: '/home/hwanginho' } }, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                res.status(500).send(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            res.status(200).json({ status: 'success' });
        });
    } else {
        res.status(400).json({ status: 'ignored' });
    }
});

router.use((err,req,res,next)=> {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

module.exports = router;