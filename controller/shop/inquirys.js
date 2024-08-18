const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { create, fullGet, someGet, remove, dataEdit } = require('../../utils/crud')
const { userCheck } = require('../../utils/user-check')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
require('dotenv').config({ path: '../../.env.dev' })

// 문의 생성 - API TEST OK
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


// 문의 전체 조회 - API TEST OK
router.get('/', authticateToken, async (req, res) => {
	try {
		const result = await fullGet('inquirys', res)
		res.status(200).json({ statusCode: 200, message: '문의 전체 조회 성공', data: result.rows })
	} catch (e) {
		console.log('inquirys 전체조회 실패', e)
		res.status(500).json({ statusCode: 500, message: '서버에러임', content: '관리자에게 문의해주세요.' })
	}
})

// 특정 문의 조회 -API TEST OK
router.get('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const result = await someGet('inquirys', '_id', _id)
		res.status(200).json({ statusCode: 200, message: '특정 문의 조회 성공', data: result.rows })
	} catch (e) {
		console.log('inquirys 특정조회 실패', e)
		res.status(500).json({ statusCode: 500, message: '서버에러임', content: '관리자에게 문의해주세요.' })
	}
})


//! 문의 수정 - API TEST OK
/// 하나만 수정하면 나머지는 null 처리됨 
/// 이문제를 나중에 수정해야함
router.patch('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const { inquiry_category, inquiry_email, inquiry_files, inquiry_title, inquiry_details, is_public } = req.body
		const columns = ['inquiry_category', 'inquiry_email', 'inquiry_files', 'inquiry_title', 'inquiry_details', 'is_public']
		const values = [inquiry_category, inquiry_email, inquiry_files, inquiry_title, inquiry_details, is_public]
		const result = await dataEdit('inquirys', columns, values, '_id', _id)
		res.status(200).json({ statusCode: 200, message: '문의 수정 성공', data: result.rows })
	} catch (e) {
		console.log('inquirys 수정 실패', e)
		res.status(500).json({ statusCode: 500, message: '서버에러임', content: '관리자에게 문의해주세요.' })
	}
})

// 문의 삭제 - API TEST OK
router.delete('/:_id', authticateToken, async (req, res) => {
	try {
		const { _id } = req.params
		const result = await remove('inquirys', '_id', _id)
		res.status(200).json({ statusCode: 200, message: '문의 삭제 성공', data: result.rows })
	} catch (e) {
		console.log('inquirys 삭제 실패', e)
		res.status(500).json({ statusCode: 500, message: '서버에러임', content: '관리자에게 문의해주세요.' })
	}
})

module.exports = router