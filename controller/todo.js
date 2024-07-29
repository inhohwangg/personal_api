const express = require('express');
const router = express.Router();
const authticateToken = require('./auth-middleware');
const pool = require('../dbConnection');
const multer = require('multer');
const path = require('path')
const fs = require('fs');

// Multer 설정
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadDir = 'uploads/'

		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir);
		}
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	}
})
const upload = multer({ storage: storage });

router.get('/status', (req, res) => {
	res.status(200).json({ status: 200, message: 'todo api is work!' })
})

// todo_list 만들기
router.post('/', upload.single('image'), async (req, res) => {
	try {
		const { title, description } = req.body;
		const imageFile = req.file;

		if (!imageFile) {
			return res.status(400).json({ error: 'Image file is required' })
		}

		const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imageFile.filename}`;

		const result = await pool.query(
			'INSERT INTO todo_list (title, description, image_name, image_size, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
			[title, description, imageFile.originalname, imageFile.size, imageUrl]
		);

		res.json(result.rows[0])
	} catch (e) {
		console.log('todo.js --------------> post Error Message :', e);
	}
})


// todo_list 완료하기
router.patch('/:id', async (req, res) => {
	try {
		const { id } = req.params; // URL 파라미터에서 id 추출
		const { is_completed } = req.body; // 요청 바디에서 is_completed 추출

		const result = await pool.query(
			'UPDATE todo_list SET is_completed = $2, updated_at = CURRENT_TIMESTAMP WHERE _id = $1 RETURNING *',
			[id, is_completed] // $1과 $2에 해당하는 값을 배열로 전달
		);

		res.json(result.rows[0]); // 업데이트된 row 반환
		console.log(result.rows[0]); // 서버 로그에 결과 출력
	} catch (e) {
		console.log('todo.js patch Error Message :', e); // 에러 로깅
		res.status(400).json({ error: e.message }); // 클라이언트에 에러 메시지 응답
	}
});

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