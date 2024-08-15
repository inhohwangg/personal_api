const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { create } = require('../../utils/crud')
const { userCheck } = require('../../utils/user-check')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
require('dotenv').config({ path: '../../.env.dev' })

// 문의 생성
router.post('/create/:userid/:productid', authticateToken, async (req, res) => {
	try {
		const { userid, productid } = req.params
		const { inquiry_category, inquiry_email, inquiry_files, inquiry_title, inquiry_details, is_public } = req.body
		const inquirys_id = uuidv4()

		const columns = ['_id', 'userid', 'inquiry_category', 'inquiry_email', 'inquiry_files', 'inquiry_title', 'inquiry_details', 'is_public', 'productid', 'created_at', 'updated_at']
		const values = [inquirys_id, userid, inquiry_category, inquiry_email, inquiry_files, inquiry_title, inquiry_details, is_public, productid, new Date(), new Date()]
		const result = await create('inquirys', columns, values, res)
		res.status(201).json({ statusCode: 201, message: 'inquiry 생성 성공', data: result.rows })
	} catch (e) {
		console.log('inquirys 생성 실패', e)
		res.status(500).json({ statusCode: 500, message: '서버에러임', content: '관리자에게 문의해주세요.' })
	}
})


// 문의 전체 조회

// 특정 문의 조회

// 문의 수정

// 문의 삭제

module.exports = router