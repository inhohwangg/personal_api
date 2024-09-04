var express = require('express');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy
const jwt = require('jsonwebtoken')
const {v4: uuidv4} = require('uuid');
const {create, someGet} = require('../utils/crud')
require('dotenv').config();

passport.use(new KakaoStrategy({
	clientID: process.env.KAKAO_REST_API_KEY,
	callbackURL: process.env.KAKAO_CALLBACK_URL,
},async (accessToken, refreshToken, profile,done) => {
	try {
		const kakaoId = profile.id
		const email = profile._json.kakao_account.email
		const username = profile._json.properties.nickname

		// 사용자 존재하는지 확인
		let user = await someGet('users', 'userid', kakaoId)

		if (user.rowCount === 0) {
			const newUser = {
				_id: uuidv4(),
				userid: kakaoId.toString(),
				username: username,
				email: email,
				role: '사용자'
			}

			user = await create('users', ['_id', 'userid', 'username', 'email','role', 'created_at', 'updated_at'],
				[newUser._id, newUser.userid, newUser.username, newUser.email, newUser.role, new Date(), new Date()]
			)
			user = user.rows[0]
		} else {
			user = user.rows[0]
		}

		const token = jwt.sign({id: user.id, userid: user.userid}, process.env.SECRET_KEY, {
			expiresIn : '90d'
		})

		return done(null, {user, token})

	}catch (e) {
		console.log('카카오 로그인 중 에러 발생', e)
		return done(e)
	}
}
))

passport.serializeUser((user, done) => {
	done(null, user)
})

passport.deserializeUser((user, done) => {
	done(null, user)
})

const router = express.Router()

router.get('/auth/kakao', passport.authenticate('kakao'))

router.get('/auth/kakao/callback', passport.authenticate('kakao', {
	failureRedirect: '/kakao-failed',
	session: false
}), (req,res)=> {
	try {
		if (!req.user || !req.user.token) throw Error('토큰 생성에 실패했습니다.')
			res.json({
		statusCode: 200,
		message: '카카오 로그인 성공',
		user: req.user.user,
		token: req.user.token
		})
	}catch (e) {
		console.log('카카오 로그인 응답 처리 중 에러 발생 :',e)
		res.status(500).json({
			statusCode: 500,
			message: e.message
		})
	}
})

module.exports = router