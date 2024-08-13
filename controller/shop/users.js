const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
const pool = require('../../dbConnection')
require('dotenv').config({path: '../../.env.dev'})

router.get('/status', (req, res) => {
    return res.status(200).json({status: '200',message: '정상 동작중'})
})

// 사용자 생성 - OK
router.post('/create', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // 필수 필드 체크
        if (!username || !email || !password || !role) return res.status.json({ message: '모든 필드를 입력해주세요' })

        // 이메일 형식 체크
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) return res.status(422).json({ message: '이메일 형식에 맞지 않습니다.' })

        // username 중복 체크
        const usernameExistCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username])
        if (usernameExistCheck.rows.length > 0) return res.status(409).json({ message: '이미 존재하는 사용자입니다.' })

        // email 중복 체크
        const emailExistCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        if (emailExistCheck.rows.length > 0) return res.status(409).json({ message: '이미 존재하는 이메일입니다.' })

        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 고유 식별자 생성
        const _id = uuidv4()

        const createdAt = new Date();

        const result = await pool.query(`INSERT INTO users (_id, username, email, password, passwordconfirm, role, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [_id, username, email, hashedPassword, hashedPassword, role, createdAt, createdAt])

        console.log(result.rows[0])
        return res.status(201).json({ statusCode: 200, message: '사용자가 성공적으로 생성되었습니다.', data: result.rows[0] })
    } catch (e) {
        console.log('사용자 생성 실패', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요' })
    }
})

// 로그인 - OK
router.post('/login', async (req,res)=> {
    try {
        const {username, password} = req.body;

        // 필수 필드 체크
        if (!username)  res.status(400).json({ statusCode: 400, message:'사용자 이름을 입력해주세요' })
        if (!password)  res.status(400).json({ statusCode: 400, message:'비밀번호를 입력해주세요' })

        // 사용자 존재 여부 확인
        const userExistCheck = await pool.query(`SELECT * FROM users WHERE username = $1`, [username])
        const user = userExistCheck.rows[0]

        if (!user) res.status(400).json({statusCode: 400 , message: '사용자가 존재하지 않습니다.'})
        
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) res.status(400).json({statusCode: 400, message : '비밀번호가 일치하지않습니다.'})

        // 토큰 유효기간 1년
        const token = jwt.sign({userId: user._id, role: user.role}, process.env.SECRET_KEY, {expiresIn : '1y'})

        return res.status(200).json({statusCode: 200, message: '로그인 성공', token: token, data: user})

    }catch (e) {
        console.log('로그인 실패',e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요' })
    }
})


// 사용자 전체 조회 - OK
router.get('/', authticateToken,async (req,res)=> {
    try {
       const result = await pool.query(`SELECT * FROM users`)
       return res.status(200).json({statusCode: 200, message : '조회 성공', data : result.rows})
    }catch (e) {
        console.log('사용자 조회 실패',e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요' })
    }
})

// _id 로 특정 사용자 조회 - OK
router.get('/:_id', authticateToken,async  (req,res)=> {
    try {
        const {_id} = req.params;
        const userExistCheck = await pool.query(`SELECT * FROM users WHERE _id = $1`,[_id])
        const user = userExistCheck.rows[0]
        console.log(user)
        if (!user) return res.status(400).json({statusCode: 400, message : '해당 사용자가 없습니다'})

        return res.status(200).json({statusCode: 200, message  : '조회 성공', data  : user})
    }catch (e) {
        console.log('사용자 조회 실패',e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요' })
    }
})

// 사용자 이메일 정보 수정 - OK
router.put('/email/:_id', authticateToken, async (req,res) => {
    try {
        const {_id} = req.params
        const { email } = req.body;

        const userExistCheck = await pool.query(`SELECT * FROM users WHERE _id = $1`, [_id])
        const user = userExistCheck.rows[0]

        // 사용자 존재 여부 체크
        if (!user) return res.status(400).json({statusCode: 400, message : '해당 사용자가 없습니다.'})
        
        // 이메일 중복체크
        const emailExistCheck = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
        if (emailExistCheck.rows.length > 0) return res.status(409).json({statusCode: 409, message   : '이미 존재하는 이메일입니다.'})

        // 이메일 업데이트
        const updateEmail = await pool.query(`UPDATE users SET email = $1, updated_at = $2 WHERE _id = $3 RETURNING *`,
            [email, new Date(), _id]
        )
        return res.status(200).json({statusCode: 200, message : '사용자 이메일 정보 수정 완료', data: updateEmail.rows})
    }catch (e) {
        console.log('사용자 수정 실패', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요' })
    }
})

// 사용자 권한 정보 수정 - OK
router.put('/role/:_id', authticateToken, async (req,res)=> {
    try {
        const {_id} = req.params
        const {role} = req.body

        const userExistCheck = await pool.query(`SELECT * FROM users WHERE _id = $1`, [_id])
        const user = userExistCheck.rows[0]
        // 사용자 존재 여부 체크
        if (!user) return res.status(400).json({statusCode: 400, message  : '해당 사용자가 없습니다.'})
        
        //* 변경하려는 사용자 권한과 기존의 권한이 중복되면 중복되었다고 알려줘야함

        // 사용자 업데이트
        const updateRole = await pool.query(`UPDATE users SET role = $1, updated_at=$2 WHERE _id = $3 RETURNING *`, [role, new Date(), _id])

        return res.status(200).json({statusCode: 200, message : '사용자 권한 수정 완료', data: updateRole.rows })
    }catch (e) {
        console.log('사용자 권한 수정 실패', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요' })
    }
})

// 비밀번호 변경 - OK
router.put('/change-password/:_id', authticateToken, async (req,res)=> {
    try {
        const {_id } = req.params;
        const {currentPassword, newPassword } = req.body;

        if (!currentPassword ||!newPassword ) return res.status(400).json({statusCode: 400, message : '현재 비밀번호와 새 비밀번호는 입력해주세요'})

        const userExistCheck = await pool.query(`SELECT * FROM users WHERE _id=$1`, [_id])
        const user = userExistCheck.rows[0]

        if (!user) return res.status(400).json({statusCode: 400, message  : '해당 사용자가 없습니다'})
        
        // 현재 비밀번호 일치하는지 확인
        const isPasswordMatch = await bcrypt.compareSync(currentPassword, user.password);

        //* 변경하려는 비밀번호와 새로운 비밀번호가 동일한 경우에는 동일하다고 알려줘야함
        
        if (!isPasswordMatch) return res.status(400).json({statusCode: 400, message : '현재 비밀번호가 일치하지 않습니다.'})

        // 새로운 비밀번호 해시화
        const newPasswordHash = await bcrypt.hashSync(newPassword, 10);

        // 새로운 비밀번호 업데이트
        const result = await pool.query(`UPDATE users SET password=$1, passwordconfirm=$2,updated_at=$3 WHERE _id = $4 RETURNING *`, [newPasswordHash,newPasswordHash, new Date(),_id])

        res.status(200).json({statusCode: 200, message: '비밀번호가 성공적으로 변경 완료되었습니다.', data: result.rows})
    }catch (e) {
        console.log('사용자 비밀번호 변경 실패', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요' })
    }
})

// 사용자 정보 삭제 - OK
router.delete('/:_id', authticateToken, async (req,res)=> {
    try {
        const {_id} = req.params

        const userExistCheck = await pool.query(`SELECT * FROM users WHERE _id=$1`, [_id])
        const user = userExistCheck.rows[0]

        if (!user) return res.status(400).json({statusCode:400, message:'해당 사용자가 존재하지 않습니다.' })
        
        await pool.query(`DELETE FROM users WHERE _id = $1`, [_id])

        return res.status(200).json({statusCode:200, message:'해당 사용자가 성공적으로 삭제되었습니다.'})
    }catch (e) {
        console.log('사용자 정보 삭제 실패', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요' })
    }
})

module.exports = router