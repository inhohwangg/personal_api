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
const category = require('./controller/shop/category')
const orders = require('./controller/shop/orders')
const products = require('./controller/shop/products')
const order_items = require('./controller/shop/order_items')
const carts = require('./controller/shop/carts')
const reviews = require('./controller/shop/reviews')
const inquirys = require('./controller/shop/inquirys')
const { exec } = require('child_process')
const Sentry = require('@sentry/node')
const helmet = require('helmet');
const cors = require('cors')
const passport = require('passport')
const KakaoStrategy = require('passport-kakao').Strategy
const session = require('express-session');
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const { create, someGet } = require('./utils/crud')
require('dotenv').config();

passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_REST_API_KEY,
    callbackURL: process.env.KAKAO_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const kakaoId = profile.id
        const email = profile._json.kakao_account.email
        const username = profile._json.properties.nickname

        // 사용자가 존재하는지 확인
        let user = await someGet('users', 'userid', kakaoId)

        if (user.rowCount === 0) {
            const newUser = {
                _id: uuidv4(),
                userid: kakaoId.toString(),
                username: username,
                email: email,
                role: '사용자'
            }

            user = await create('users', ['_id', 'userid', 'username', 'email', 'role', 'created_at', 'updated_at',], [newUser._id, newUser.userid, newUser.username, newUser.email, newUser.role, new Date(), new Date()])
            user = user.rows[0]
        } else {
            user = user.rows[0]
        }

        const token = jwt.sign({ id: user.id, userid: user.userid }, process.env.SECRET_KEY, {
            expiresIn: '90d'
        })

        return done(null, { user, token })

    } catch (e) {
        console.error('카카오 로그인 중 오류 발생:', e);
        return done(e);
    }

}))

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((obj, done) => {
    done(null, obj);
})

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.urlencoded({ extended: true })); // 'urlcoded'를 'urlencoded'로 수정
app.use(bodyParser.json());
app.use(helmet())
app.use(cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
    origin: true,
    credentials: true
}));

app.options('*', cors());

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
app.use('/api/shop/category', category);
app.use('/api/shop/orders', orders);
app.use('/api/shop/products', products);
app.use('/api/shop/order_items', order_items);
app.use('/api/shop/carts', carts);
app.use('/api/shop/reviews', reviews);
app.use('/api/shop/inquirys', inquirys);
// app.use('/api/kakao', authRouter)

app.use((req, res, next) => {
    res.setHeader('x-inho-api', '1.0.0');
    next();
})

app.get('/auth/kakao', passport.authenticate('kakao'));

app.get('/auth/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/kakao-failed'
}), (req, res) => {
    // 로그인 성공 후 홈으로 리디렉션
    req.json({
        message: '카카오 로그인 성공',
        token: req.user.token,
        user: req.user.user
    })
    res.redirect('/kakao');
});

app.get('/kakao', (req, res) => {
    res.json({ statusCode: 200, message: '카카오 소셜 로그인 성공' })
})

app.get('/kakao-failed', (req, res) => {
    res.json({ statusCode: 400, message: '카카오 소셜 로그인 실패' })
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

app.use(function onError(err, req, res, next) {
    res.statusCode = 500
    res.end(res.sentry + "\n")
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('My first Sentry error!');
})