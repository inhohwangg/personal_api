const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection');
const { create, fullGet, someGet, remove, dataEdit } = require('../../utils/crud');
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware');
require('dotenv').config({ path: '../../.env.dev' });

// product 생성
router.post('/create/:categoryid/:userid', authticateToken, async (req, res) => {
	try {
		const { categoryid, userid } = req.params; // req.query가 아닌 req.params 사용
		const { product_name, product_desc, product_price, product_count } = req.body;

		const categoryCheck = await pool.query('SELECT * FROM category WHERE _id = $1', [categoryid]);
		if (categoryCheck.rows.length === 0) {
			return res.status(400).json({ statusCode: 400, message: '유효하지 않은 categoryId입니다.' });
		}

		const userCheck = await pool.query('SELECT * FROM users WHERE _id = $1', [userid]);
		if (userCheck.rows.length === 0) {
			return res.status(400).json({ statusCode: 400, message: '유효하지 않은 userId입니다.' });
		}

		const productId = uuidv4();
		const columns = ['_id', 'product_name', 'product_desc', 'product_price', 'product_count', 'categoryid', 'userid', 'created_at', 'updated_at'];
		const values = [productId, product_name, product_desc, product_price, product_count, categoryid, userid, new Date(), new Date()];
		const result = await create('products', columns, values, res);

		return res.status(201).json({ statusCode: 201, message: '성공적으로 product를 생성했습니다.', data: result.rows });
	} catch (e) {
		console.log('product 생성 실패', e);
		return res.status(500).json({ statusCode: 500, message: '서버에러임', content: 'product 생성 실패' });
	}
});

// product 전체 조회
router.get('/', authticateToken, async (req, res) => {
	try {
		const result = await fullGet('products');
		res.status(200).json({ statusCode: 200, message: 'product 전체 조회 성공', data: result.rows })
	} catch (e) {
		console.log('product 전체 조회 실패', e);
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: 'product 전체 조회 실패' })
	}
})

// 특정 product 조회
router.get('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params;

		const result = await someGet('products', '_id', _id, res);
		res.status(200).json({ statusCode: 200, message: 'product 조회 성공', data: result.rows })
	} catch (e) {
		console.log('특정 product 조회 실패', e);
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '특정 product 조회 실패' })
	}
})

// product 수정
router.put('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params;
		const { product_name, product_desc, product_price, product_count } = req.body;
		const columns = ['product_name', 'product_desc', 'product_price', 'product_count']
		const values = [product_name, product_desc, product_price, product_count]
		const result = await dataEdit('products', columns, values, '_id', _id)
		res.status(200).json({ statusCode: 200, message: 'product 수정 성공', data: result.rows })
	} catch (e) {
		console.log('product 수정 실패', e);
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: 'product 수정 실패' })
	}
})

// product 삭제
router.delete('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params;
		const result = await remove('products', '_id', _id)
		res.status(200).json({ statusCode: 200, message: 'product 삭제 성공', data: result.rows })
	} catch (e) {
		console.log('product 삭제 실패', e);
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: 'product 삭제 실패' })
	}
})

module.exports = router;
