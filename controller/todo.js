const express = require('express');
const router = express.Router();
const authticateToken = require('./auth-middleware');
const pool = require('../dbConnection');

// todo_list 만들기
router.post('/', async (req, res) => {
	try {
		const { title, description } = req.body;

		const result = await pool.query(
			'INSERT INTO todo_list (title, description) VALUES ($1, $2) RETURNING *',
			[title, description]
		);
		res.json(result.rows[0])
	} catch (e) {
		console.log('todo.js --------------> post Error Message :', e);
	}
})


// todo_list 완료하기
router.patch('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { is_completed } = req.body;

		const result = await pool.query(
			'UPDATE todo_list SET	is_completed = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
			[id, is_completed]
		);

		res.json(result.rows[0])
		console.log(result.rows[0])
	} catch (e) {
		console.log('todo.js patch Error Message :', e)
		res.status(400).json({ error: e.message })
	}
})

// todo_list 전체 가져오기
router.get('/', async (req, res) => {
	try {
		const result = await pool.query("SELECT * FROM todo_list")
		res.status(200).json(result.rows);
	} catch (e) {
		console.log("todo.js get Error Message : ", e);
		res.status(500).json({ error: e.message });
	}
})

module.exports = router;