const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
require('dotenv').config({ path: '../../.env.dev' })

// product 생성

// 특정 product 조회

// product 조회

// product 수정

// product 삭제

module.exports = router