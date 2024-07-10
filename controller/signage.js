const express = require('express');
const router = express.Router();
const pool = require('../dbConnection')
const { v4: uuidv4 } = require('uuid');

// status
router.get('/status', async (req, res) => {
	try {
		res.status(200).json({
			post: {
				url: 'https://api.fappworkspace.store/api/signage',
				method: 'post',
				body: {
					"video": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
					"width": "800",
					"height": "600",
					"title": "세번째 영상",
					"content": "크롬 샘플 영상",
					"play_time": "00:01:00"
				},
				message: 'post 사용 방법 예시입니다.'
			},
			get: {
				allRead: {
					url: 'https://api.fappworkspace.store/api/signage',
					method: 'get',
				},
				onlyOneRead: {
					url: 'https://api.fappworkspace.store/api/signage?_id=${_id}',
					method: 'get',
				},
				message: 'post 사용 방법 예시입니다.'
			},
			patch: {
				url: 'https://api.fappworkspace.store/api/signage/_id',
				method: 'patch',
				message: 'post 사용 방법 예시입니다.'
			},
			delete: {
				url: 'https://api.fappworkspace.store/api/signage/_id',
				method: 'delete',
				message: 'post 사용 방법 예시입니다.'
			}
		})
	} catch (e) {
		res.status(500).json({
			status: 500,
			message: 'server error',
			error: e
		})
	}
})

// data create
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

// all data read
router.get('/', async (req, res) => {
	try {
		const query = `SELECT * FROM signage`
		const result = await pool.query(query);
		res.status(200).json({
			status: 200,
			message: 'signage data read',
			data: {
				rows: result.rows
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

// only one data read
router.get('/:_id', async (req, res) => {
	try {
		const { _id } = req.params
		const query = `SELECT * FROM signage WHERE _id= $1`
		const value = [_id];
		const result = await pool.query(query, value);

		if (result.rows.length === 0) {
			res.status(404).json({
				status: 404,
				message: 'signage data read Error require get api code confirm',
				errorMessage: 'signage data not found'
			})
		} else {
			res.status(200).json({
				status: 200,
				message: 'signage data read',
				data: {
					rows: result.rows[0]
				}
			})
		}
	} catch (e) {
		res.status(500).json({
			status: 500,
			message: 'signage data read Error require get api code confirm',
			errorMessage: e
		})
	}
})

// update
router.patch('/:_id', async (req, res) => {
	try {
		const { _id } = req.params;
		const { video, width, height, title, content, play_time } = req.body;

		const query = `
      UPDATE signage
      SET video=$1, width=$2, height=$3, title=$4, content=$5, play_time=$6
      WHERE _id=$7
    `;
		const values = [video, width, height, title, content, play_time, _id];

		const result = await pool.query(query, values);

		if (result.rowCount === 0) {
			res.status(404).json({
				status: 404,
				message: 'signage data not found',
			});
		} else {
			res.status(200).json({
				status: 200,
				message: 'signage data updated successfully',
				data: {
					video,
					width,
					height,
					title,
					content,
					play_time,
				},
			});
		}
	} catch (e) {
		res.status(500).json({
			status: 500,
			message: 'signage data update error',
			errorMessage: e,
		});
	}
});

// delete
router.delete('/:_id', async (req, res) => {
	try {
		const { _id } = req.params;
		const query = `
			DELETE FROM signage WHERE _id=$1
		`
		const values = [_id];
		const result = await pool.query(query, values);

		res.status(200).json({
			status: 200,
			message: 'signage data deleted successfully',
		})
	} catch (e) {
		res.status(500).json({
			status: 500,
			message: 'signage data delete error',
			errorMessage: e,
		})
	}
})

module.exports = router;