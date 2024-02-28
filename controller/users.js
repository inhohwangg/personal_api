const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const authticateToken = require('./auth-middleware');
const pool = require("../dbConnection");

//! 사용자 계정 생성하기
router.post("/", async (req, res) => {
  const { username, name, password, passwordconfirm, age } = req.body;

  if (password !== passwordconfirm)
    return res.status(400).send("비밀번호가 일치하지 않습니다.");

  try {
    //! 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);
    const passwordconfirm = hashedPassword

    const result = await pool.query(
      // INSERT INTO => 새로운 데이터를 테이블에 추가하겠다
      // users => 데이터를 추가할 대상 테이블의 이름
      "INSERT INTO users (username, name, password, age, passwordconfirm) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [username, name, hashedPassword, age, passwordconfirm]
    );

    const user = result.rows[0];
    // delete user.password;
    res.status(201).json(user);
  } catch (e) {
    console.log("users.js ---------> post Error Message  : ", e);
    res.status(500).json({ e: e.message });
  }
});


//! 로그인 기능
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username])
    if (result.rows.length > 0) {
      const user = result.rows[0]

      const match = await bcrypt.compare(password, user.password)
      console.log(match)
      if (match) {
        // JWT 토큰 생성
        const token = jwt.sign({ id: user.id, username: user.username }, 'secretKey', { expiresIn: '1h' })

        // 로그인 성공
        res.status(200).json({ message: '로그인 성공!', token })
      } else {
        // 비밀번호 불일치
        res.status(400).json({ error: '비밀번호가 일치하지 않습니다.' })
      }
    } else {
      // 계정 없음
      res.status(400).json({ error: '사용자가 존재하지 않습니다.' })
    }
  } catch (e) {
    console.log('login error message :', e)
    res.status(500).json({ e: e.message })
  }
})


//! 전체 사용자 조회
router.get('/', authticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
  } catch (error) {
    console.log('user get error message :', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router;
