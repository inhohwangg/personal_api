const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Multer 설정
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = 'uploads/';

		// 디렉토리가 없으면 생성
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		const extension = path.extname(file.originalname);
		cb(null, uniqueSuffix + extension);
	}
});

// Multer 인스턴스 생성
const upload = multer({ storage: storage });

module.exports = upload;