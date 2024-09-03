const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env.dev' })


const authticateToken = (req, res, next) => {
	const authHeader = req.headers['x-viewtrack-token'];
	let token;

	if (authHeader) {
		if (authHeader.startsWith('Bearer ')) {
			token = authHeader.substring(7, authHeader.length);
		} else {
			token = authHeader;
		}
	}

	// console.log(authHeader);
	// const token = authHeader && authHeader.split(' ')[1];
	if (!authHeader) return res.sendStatus(401);

	jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
}

module.exports = { authticateToken };
