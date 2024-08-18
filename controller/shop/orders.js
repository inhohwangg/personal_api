const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { create, fullGet, someGet, remove, dataEdit } = require('../../utils/crud')
const { userCheck } = require('../../utils/user-check')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
require('dotenv').config({ path: '../../.env.dev' })

// order 생성 - API TEST OK
router.post('/create/:userid', authticateToken, async (req, res) => {
    try {
        const { userid } = req.params
        const { pay_method, address, delivery_cost, tracking_number, order_count, order_amount, order_status } = req.body

        const user = userCheck('users', 'username', userid)
        if (!user) return res.status(400).json({ statusCode: 400, message: '유저가 존재하지 않습니다', content: '유저를 찾아주세요', apiErrorMessage: '해당 유저가 없음' })

        const order_id = uuidv4()

        if (!pay_method || !address || !delivery_cost || !tracking_number || !order_count || !order_status || !order_amount) res.status.json({ statusCode: 400, message: '필수항목이 누락되었습니다.' })

        const columns = ['_id', 'userid', 'pay_method', 'address', 'delivery_cost', 'tracking_number', 'order_count', 'order_amount', 'order_status', 'created_at', 'updated_at']
        const values = [order_id, userid, pay_method, address, delivery_cost, tracking_number, order_count, order_amount, order_status, new Date(), new Date()]
        const result = await create('orders', columns, values, res)

        res.status(201).json({ statusCode: 201, message: '주문이 성공적으로 등록되었습니다.', content: result.rows })
    } catch (e) {
        console.log('order 생성 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: 'order 생성 에러' })
    }
})

// 특정 order 조회 - API TEST OK
router.get('/:_id', async (req, res) => {
    try {
        const { _id } = req.params

        const id = userCheck('orders', '_id', _id)

        if (!id) return res.status(400).json({ statusCode: 400, message: `${_id} 가 존재하지 않습니다.` })

        const result = await someGet('orders', '_id', _id, res)

        res.status(200).json({ statusCode: 200, message: 'success', data: result.rows })
    } catch (e) {
        console.log('order 조회 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: 'order 조회 에러' })
    }
})

// order 전체 조회 - API TEST OK
router.get('/', async (req, res) => {
    try {
        const result = await fullGet('orders')
        res.status(200).json({ statusCode: 200, message: 'orders 전체 조회 성공', data: result.rows })
    }
    catch (e) {
        console.log('order 전체 조회 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: 'order 전체 조회 에러' })

    }
})

// order 수정 - API TEST OK
router.put('/:_id', async (req, res) => {
    try {
        const { _id } = req.params
        const { pay_method, address, delivery_cost, tracking_number, order_count, order_amount, order_status } = req.body
        const columns = ['pay_method', 'address', 'delivery_cost', 'tracking_number', 'order_count', 'order_amount', 'order_status']
        const values = [pay_method, address, delivery_cost, tracking_number, order_count, order_amount, order_status]
        const result = await dataEdit('orders', columns, values, '_id', _id)
        res.status(200).json({ statusCode: 200, message: 'order 수정 성공', data: result.rows })
    } catch (e) {
        console.log('order 수정 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: 'order 수정 에러' })
    }
})

// order 삭제 - API TEST OK
router.delete('/:_id', async (req, res) => {
    try {
        const { _id } = req.params
        const result = await remove('orders', '_id', _id)
        res.status(200).json({ statusCode: 200, message: 'order 삭제 성공', data: result.rows })
    } catch (e) {
        console.log('order 삭제 에러', e)
        return res.status(500).json({ statusMessage: '서버 에러임', message: e, content: '관리자에게 문의하세요', apiErorMessage: 'order 삭제 에러' })
    }
})

module.exports = router