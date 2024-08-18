const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { create, fullGet, someGet, remove, dataEdit } = require('../../utils/crud');
const { userCheck } = require('../../utils/user-check')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
require('dotenv').config({ path: '../../.env.dev' })

// 장바구니 생성 - API TEST OK
router.post('/create/:userid/:productid', authticateToken, async (req, res) => {
	try {
		const { userid, productid } = req.params
		const { quantity, order_status } = req.body

		const carts_id = uuidv4()

		const columns = ['_id', 'userid', 'productid', 'quantity', 'order_status', 'created_at', 'updated_at']
		const values = [carts_id, userid, productid, quantity, order_status, new Date(), new Date()]
		const result = await create('carts', columns, values, res)

		res.status(201).json({ statusCode: 201, message: '장바구니 생성 완료', data: result.rows })
	} catch (e) {
		console.log('장바구니 생성 실패!', e)
		res.status(500).json({ statusCode: 500, message: '서버에러임', content: '관리자에게 문의해주세요' })
	}
})

// 장바구니 전체 조회 -API TEST OK
router.get('/', authticateToken, async (req, res) => {
	try {
		const result = await fullGet('carts', res)
		res.status(200).json({ statusCode: 200, message: '장바구니 전체 조회 완료', data: result.rows })
	} catch (e) {
		console.log('장바구니 전체 조회 실패!', e)
		res.status(500).json({ statusCode: 500, message: '서버에러임', content: '관리자에게 문의해주세요' })
	}
})

// 특정 장바구니 조회 -API TEST OK
router.get('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const result = await someGet('carts', '_id', _id)
		res.status(200).json({ statusCode: 200, message: '장바구니 조회 완료', data: result.rows })
	} catch (e) {
		console.log('장바구니 조회 실패!', e)
		res.status(500).json({ statusCode: 500, message: '서버에러임', content: '관리자에게 문의해주세요' })
	}
})

// 장바구니 수정 - API TEST OK
router.put('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const { quantity } = req.body
		const result = await dataEdit('carts', 'quantity', quantity, '_id', _id)
		res.status(200).json({ statusCode: 200, message: '장바구니 수정 완료', data: result.rows })
	} catch (e) {
		console.log('장바구니 수정 실패!', e)
		res.status(500).json({ statusCode: 500, message: '서버에러임', content: '관리자에게 문의해주세요' })
	}
})

// 장바구니 삭제 - API TEST OK
router.delete('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const result = await remove('carts', '_id', _id)
		res.status(200).json({ statusCode: 200, message: '장바구니 삭제 완료', data: result.rows })
	} catch (e) {
		console.log('장바구니 삭제 실패!', e)
		res.status(500).json({ statusCode: 500, message: '서버에러임', content: '관리자에게 문의해주세요' })
	}
})

module.exports = router;