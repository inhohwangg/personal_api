require("./instrument")

const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const userRouters = require('./controller/users');
const todoRouters = require('./controller/todo')
const pushNotification = require('./controller/push-notification')
const authRouter = require('./controller/kakao-auth')
const webhook = require('./controller/webhook-handler')
const signage = require('./controller/signage')
const shopUser = require('./controller/shop/users')
const { exec } = require('child_process')
const Sentry = require('@sentry/node')

// const session = require('express-session')
// const { passport } = require('./controller/auth-middleware')
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true })); // 'urlcoded'를 'urlencoded'로 수정
app.use(bodyParser.json());

// app.use(session({
//     secret: '비밀키', // 'secret' 옵션으로 수정
//     resave: false,
//     saveUninitialized: false,
// }))

// passport 초기화 및 세션 사용 설정 추가
// app.use(passport.initialize());
// app.use(passport.session());

// 정적 파일 제공
app.use('/files', express.static('uploads'));

app.use('/api/users', userRouters);
app.use('/api/todo', todoRouters);
app.use('/api/push', pushNotification);
app.use('/api/webhook', webhook);
app.use('/api/signage', signage);
app.use('/api/shop/users', shopUser);
// app.use('/api/kakao', authRouter)

app.use((req, res, next) => {
    res.setHeader('x-inho-api', '1.0.0');
    next();
})

app.get('/', (req, res) => {
    res.json({ user: 'http://api.example.com/users?page=2' });
});

app.get('/test', (req, res) => {
    res.json({ user: 'http://api.example.com/users?page=3' });
});

app.post('/', (req, res) => {
    res.send('Got a POST request');
});

app.put('/user', (req, res) => {
    res.send('Got a PUT request at /user');
});

app.delete('/user', (req, res) => {
    res.send('Got a DELETE request at /user');
});

app.get("/api/scrape", (req, res) => {
    exec('python scraper.py', (error, stdout, stderr) => {
        if (error) {
            console.error('exec error: ${error}')
            return res.status(500).send(error)
        }
        console.log(`stdout: ${stdout}`)
        console.error(`stderr: ${stderr}`)
        res.send(stdout)
    })
})

Sentry.setupExpressErrorHandler(app)

app.use(function onError(err, req,res,next) {
    res.statusCode = 500
    res.end(res.sentry + "\n")
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('My first Sentry error!');
})