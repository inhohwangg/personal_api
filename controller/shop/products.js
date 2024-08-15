const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection');
const { create } = require('../../utils/crud');
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

module.exports = router;
