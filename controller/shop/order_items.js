const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { create, fullGet, someGet, remove, dataEdit } = require('../../utils/crud')
const { userCheck } = require('../../utils/user-check')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
require('dotenv').config({ path: '../../.env.dev' })

// order_items 생성 - API TEST OK
router.post('/create/:orderid/:productid', authticateToken, async (req, res) => {
	try {
		const { orderid, productid } = req.params;
		const { order_count, product_price } = req.body;

		const order_items_id = uuidv4()

		const columns = ['_id', 'orderid', 'productid', 'order_count', 'product_price', 'created_at', 'updated_at']
		const values = [order_items_id, orderid, productid, order_count, product_price, new Date(), new Date()]
		const result = await create('order_items', columns, values, res)

		res.status(201).json({ statusCode: 201, message: 'order_items 생성 완료', data: result.rows })
	} catch (e) {
		console.log('order_items 생성 실패!', e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요.' })
	}
})

// order_items 전체 조회 - API TEST OK
router.get('/', authticateToken, async (req, res) => {
	try {
		const result = await fullGet('order_items', res)
		res.status(200).json({ statusCode: 200, message: 'order_items 전체 조회 완료', data: result.rows })
	} catch (e) {
		console.log('order_items 전체 조회 실패!', e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요.' })
	}
})

// 특정 order_items 조회 - API TEST OK
router.get('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const result = await someGet('order_items', '_id', _id, res)
		res.status(200).json({ statusCode: 200, message: '특정 order_items 조회 완료', data: result.rows })
	} catch (e) {
		console.log('order_items 조회 실패!', e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요.' })
	}
})

// order_items 수정 - API TEST OK
router.put('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const { order_count, product_price } = req.body
		const columns = ['order_count', 'product_price']
		const values = [order_count, product_price]
		const result = await dataEdit('order_items', columns, values, '_id', _id, res)
		res.status(200).json({ statusCode: 200, message: '특정 order_items 수정 완료', data: result.rows })
	} catch (e) {
		console.log('order_items 수정 실패!', e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요.' })
	}
})

// order_items 삭제 - API TEST OK
router.delete('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const result = await remove('order_items', '_id', _id, res)
		res.status(200).json({ statusCode: 200, message: '특정 order_items 삭제 완료', data: result.rows })
	} catch (e) {
		console.log('order_items 삭제 실패!', e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요.' })
	}
})

module.exports = router