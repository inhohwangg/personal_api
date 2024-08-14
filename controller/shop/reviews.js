const express = require('express');
const router = express.Router();
const pool = require('../../dbConnection')
const { v4: uuidv4 } = require('uuid');
const { authticateToken } = require('../auth-middleware')
require('dotenv').config({ path: '../../.env.dev' })

// reviews 생성

// 특정 reviews 조회

// reviews 조회

// reviews 수정

// reviews 삭제

module.exports = router