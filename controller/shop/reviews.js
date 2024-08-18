const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { create, fullGet, someGet, remove, dataEdit } = require('../../utils/crud')
const { userCheck } = require('../../utils/user-check')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
require('dotenv').config({ path: '../../.env.dev' })

// reviews 생성 - API TEST OK
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

// reviews  전체조회 - API TEST OK
router.get('/', authticateToken, async (req, res) => {
	try {
		const result = await fullGet('reviews')
		res.status(200).json({ statusCode: 200, message: '리뷰 조회 완료', data: result.rows })
	} catch (e) {
		console.log('리뷰 전체조회 실패', e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요' })
	}
})


// 특정 reviews 조회 - API TEST OK
router.get('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const result = await someGet('reviews', '_id', _id, res)
		res.status(200).json({ statusCode: 200, message: '리뷰 조회 완료', data: result.rows })
	} catch (e) {
		console.log('리뷰 조회 실패', e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요' })
	}
})

// reviews 수정 - API TEST OK
router.put('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const { review_star, review_comment } = req.body
		const columns = ['review_star', 'review_comment']
		const values = [review_star, review_comment]
		const result = await dataEdit('reviews', columns, values, '_id', _id)
		res.status(200).json({ statusCode: 200, message: '리뷰 수정 완료', data: result.rows })
	} catch (e) {
		console.log('리뷰 수정 실패', e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요' })
	}
})

// reviews 삭제 - API TEST OK
router.delete('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const result = await remove('reviews', '_id', _id)
		res.status(200).json({ statusCode: 200, message: '리뷰 삭제 완료', data: result.rows })
	} catch (e) {
		console.log('리뷰 삭제 실패', e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요' })
	}
})


module.exports = router