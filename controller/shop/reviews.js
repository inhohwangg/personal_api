const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { create } = require('../../utils/crud')
const { userCheck } = require('../../utils/user-check')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
require('dotenv').config({ path: '../../.env.dev' })

// reviews 생성
router.post('/create/:userid/:productid', authticateToken, async (req, res) => {
	try {
		const { userid, productid } = req.params;
		const { review_star, review_comment } = req.body;
		const reviews_id = uuidv4()

		const columns = ['_id', 'userid', 'productid', 'review_star', 'review_comment', 'created_at', 'updated_at']
		const values = [reviews_id, userid, productid, review_star, review_comment, new Date(), new Date()]
		const result = await create('reviews', columns, values, res)
		res.status(201).json({ statusCode: 201, message: '리뷰 생성 완료', data: result.rows })
	} catch (e) {
		console.log('리뷰 생성 실패', e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요' })
	}
})

// reviews  전체조회

// 특정 reviews 조회

// reviews 수정

// reviews 삭제

module.exports = router