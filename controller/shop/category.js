const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { v4: uuidv4 } = require('uuid');
const { create, fullGet, someGet, remove, dataEdit } = require('../../utils/crud')
const { authticateToken } = require('../auth-middleware');
const { auth } = require('firebase-admin');
require('dotenv').config({ path: '../../.env.dev' })

// 카테고리 생성 - API TEST OK
router.post('/create', authticateToken, async (req, res) => {
    try {
        const { cate_name, cate_desc } = req.body;

        if (!cate_name || !cate_desc) return res.status(400).json({ statusCode: 400, message: '필수 항목을 입력해주세요' })

        // cate_name 중복체크 
        const cate_nameExistCheck = await pool.query(`SELECT * FROM category WHERE cate_name=$1`, [cate_name])
        if (cate_nameExistCheck.rows.length > 0) return res.status(409).json({ statusCode: 409, message: '이미 존재하는 카테고리입니다.' })

        const categoryId = uuidv4()
        const columns = ['_id', 'cate_name', 'cate_desc', 'created_at', 'updated_at']
        const values = [categoryId, cate_name, cate_desc, new Date(), new Date()]
        const result = await create('category', columns, values, res)

        res.status(201).json({ statusCode: 200, message: '카테고리가 성공적으로 생성되었습니다.', data: result.rows[0] })
    } catch (e) {
        console.log('카테고리 생성 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: '카테고리 생성 에러' })
    }
})

// 특정 카테고리 조회 - API TEST OK
router.get('/:_id', authticateToken, async (req, res) => {
    try {
        const { _id } = req.params
        const result = await someGet('category', '_id', _id, res)
        return res.status(200).json({ statusCode: 200, message: `${_id} 카테고리 조회 성공`, data: result.rows })
    } catch (e) {
        console.log('카테고리 조회 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: '카테고리 조회 에러' })
    }
})

// 카테고리 전체 조회 - API TEST OK
router.get('/', authticateToken, async (req, res) => {
    try {
        const result = await fullGet('category', res)
        res.status(200).json({ statusCode: 200, message: '카테고리 조회 성공', data: result.rows })
    } catch (e) {
        console.log('카테고리 조회 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: '카테고리 조회 에러' })
    }
})

// 카테고리 수정 - API TEST OK
router.put('/:_id', authticateToken, async (req, res) => {
    try {
        const { _id } = req.params;
        const { cate_name, cate_desc } = req.body
        const columns = ['cate_name', 'cate_desc']
        const values = [cate_name, cate_desc]
        const result = await dataEdit('category', columns, values, '_id', _id)
        return res.status(200).json({ statusCode: 200, message: '카테고리 수정 성공', data: result.rows })
    } catch (e) {
        console.log('카테고리 수정 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: '카테고리 수정 에러' })
    }
})

// 카테고리 삭제 - API TEST OK
router.delete('/:_id', authticateToken, async (req, res) => {
    try {
        const { _id } = req.params
        const result = await remove('category', '_id', _id)
        return res.status(200).json({ statusCode: 200, message: '카테고리 삭제 성공', data: result.rows })
    } catch (e) {
        console.log('카테고리 삭제 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: '카테고리 삭제 에러' })
    }

})

module.exports = router