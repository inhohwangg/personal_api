const express = require('express');
const router = express.Router();
const pool = require('../dbConnection')
const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res) => {
	try {
		const { video, width, height, title, content, play_time } = req.body
		const _id = uuidv4();

		const query = `
			INSERT INTO signage (_id , video , width , height , title , content , play_time )
			VALUES ($1, $2, $3, $4, $5, $6, $7);
		`;

		const values = [_id, video, width, height, title, content, play_time]

		await pool.query(query, values);

		res.status(201).json({
			status: 201,
			message: 'signage data new create',
			data: {
				'video': video,
				'width': width,
				'height': height,
				'title': title,
				'content': content,
				'play_time': play_time
			}
		},)
	} catch (e) {
		res.status(500).json({
			status: 500,
			message: 'signage data create Error require post api code confirm',
			errorMessage: e
		})
	}
})

router.get('/', async (req, res) => {
	try {
		const query = `SELECT * FROM signage`
		const result = await pool.query(query);
		res.status(200).json({
			status: 200,
			message: 'signage data read',
			data: {
				rows: result.rows[0]
			}
		})
	} catch (e) {
		res.status(500).json({
			status: 500,
			message: 'signage data read Error require get api code confirm',
			errorMessage: e
		})
	}
})

module.exports = router;