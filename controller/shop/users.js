const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const { authenitication } = require('../auth-middleware')
const pool = require('../../dbConnection')

// 사용자 생성
router.post('/create', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // 필수 필드 체크
        if (!username || !email || !password || !role) return res.status.json({ message: '모든 필드를 입력해주세요' })

        // username 중복 체크
        const usernameExistCheck = await db.query('SELECT * FROM users WHERE username = $1', [username])
        if (usernameExistCheck.rows.length > 0) return res.status(409).json({ message: '이미 존재하는 사용자입니다.' })

        // email 중복 체크
        const emailExistCheck = await db.query('SELECT * FROM users WHERE email = $1', [email])
        if (emailExistCheck.rows.length > 0) return res.status(409).json({ message: '이미 존재하는 이메일입니다.' })

        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 고유 식별자 생성
        const _id = uuidv4()

        const createdAt = new Date();

        const result = await db.query(`INSERT INTO users (_id, username, email, password, passwordConfirm, role, created_at, update_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [_id, username, email, hashedPassword, hashedPassword, role, createdAt, createdAt])
    } catch (e) {
        res.status(500).json({ message: '서버에러', content: '관리자에게 문의하세요' })
        console.log('사용자 생성 실패', e)
    } finally {
        res.status(201).json({ statusCode: 200, message: '사용자가 성공적으로 생성되었습니다.', data: result})
    }
})


// 로그인

// 사용자 조회

// 사용자 정보 수정

// 사용자 정보 삭제


module.exports = router