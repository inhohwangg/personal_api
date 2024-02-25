const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const client = require("../dbConnection");

router.post("/", async (req, res) => {
  const { username, name, password, passwordConfirm, age } = req.body;

  if (password !== passwordConfirm)
    return res.status(400).send("비밀번호가 일치하지 않습니다.");

  try {
    //! 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await client.query(
      "INSERT INTO users (username, name, password, age) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, name, hashedPassword, age]
    );

    const user = result.rows[0];
    delete user.password;
    res.status(201).json(user);
  } catch (e) {
    console.log("users.js ---------> post Error Message  : ", e);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
