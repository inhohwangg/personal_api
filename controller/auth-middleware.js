const jwt = require('jsonwebtoken');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
require('dotenv').config({path: '../.env.dev'})
// passport.use(new KakaoStrategy({
// 	clientID: process.env.KAKAO_CLIENT_ID, // 오타 수정: cilentID -> clientID
// 	callbackURL: process.env.KAKAO_CALL_BACK_URL,
// },
// 	function (accessToken, refreshToken, profile, done) {
// 		return done(null, profile)
// 	}
// ));

// 사용자 인증 후 사용자 정보를 세션에 저장
passport.serializeUser(function (user, done) {
	done(null, user);
});

// 사용자 정보를 세션에서 읽어옴
passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

const authticateToken = (req, res, next) => {
	const authHeader = req.headers['x-viewtrack-token'];
	let token;

	if (authHeader) {
		if (authHeader.startsWith('Bearer ')) {
			token = authHeader.substring(7, authHeader.length);
		} else {
			token = authHeader;
		}
	}

	// console.log(authHeader);
	// const token = authHeader && authHeader.split(' ')[1];
	if (!authHeader) return res.sendStatus(401);

	jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
}

module.exports = { authticateToken, passport };
