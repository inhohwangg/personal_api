const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
require('detenv').config({ path: '../../.env.dev' })

// order 생성
router.post('/create', authticateToken, async (req, res) => {
    try {
        const { userId } = req.params
        const { pay_method , address , delivery_cost, tracking_number, order_mount,order_status } = req.body

        const userExistCheck = await pool.query('SELECT * FROM users WHERE username=?', [userId])
        if (!userExistCheck.rows[0]) res.status(400).json({statusCode: 400, message:'해당 유저가 없습니다', content: '유저를 찾아주세요', apiErrorMessage: '해당 유저가 없음' })
        
        const order_id = uuidv4()

        if (!pay_method || !address || !delivery_cost || !tracking_number || !order_mount || !order_status) res.status.json({statusCode: 400, message: '필수항목이 누락되었습니다.'})

        const orderCreate = await pool.query('INSERT INTO orders (_id, userId, pay_method, address, delivery_cost, tracking_number, order_mount, order_status, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
             [order_id, userId, pay_method, address, delivery_cost, tracking_number, order_mount, order_status,new Date(), new Date()])

        res.status(201).json({statusCode: 201, message:'주문이 성공적으로 등록되었습니다.', content: orderCreate.rows})
    } catch (e) {
        console.log('order 생성 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: 'order 생성 에러' })
    }
})

// 특정 order 조회
router.get('/:_id', async (req, res) => {
    try {
        const { _id } = req.params

        const idExistCheck = await pool.query('SELECT * FROM orders WHERE _id = $1', [_id])
        const id = idExistCheck.rows[0]

        if (!id) return res.status(400).json({ statusCode: 400, message: `${_id} 가 존재하지 않습니다.` })

        const result = await pool.query('SELECT * FROM orders WHERE _id = $1', [_id])

        res.status(200).json({ statusCode: 200, message: 'success', data: result.rows })
    } catch (e) {
        console.log('order 조회 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: 'order 조회 에러' })
    }
})

// order 조회
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders')
        res.status(200).json({ statusCode: 200, message: 'orders 전체 조회 성공', data: result.rows })
    }
    catch (e) {
        console.log('order 전체 조회 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: 'order 전체 조회 에러' })

    }
})
// order 수정
router.put('/:_id', async (req, res) => {
    try {
        const { _id } = req.params
    } catch (e) {
        console.log('order 수정 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: 'order 수정 에러' })
    }
})

// order 삭제
router.delete('/:_id', async (req, res) => {
    try {
        const { _id } = req.params
        const result = await pool.query('DELETE FROM orders WHERE _id=$1 RETURNING *', [_id])
        res.status(200).json({ statusCode: 200, message: 'order 삭제 성공', data: result })
    } catch (e) {
        console.log('order 삭제 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: 'order 삭제 에러' })
    }
})

module.exports = router