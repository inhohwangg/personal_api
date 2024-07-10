const express = require('express');
const router = express.Router();
const pool = require('../dbConnection')
const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res) => {
	try {
		const { _id, video, width, height, title, content, play_time } = req.body

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
				'_id': _id,
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
			message: 'signage data create Error require api code confirm',
		})
		console.log('signage data create Error', e)
	}
})

module.exports = router;