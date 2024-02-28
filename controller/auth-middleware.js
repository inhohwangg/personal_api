const jwt = require('jsonwebtoken')

const authticateToken = (req, res, next) => {
	const authHeader = req.headers['x-viewtrack-token'];
	console.log(authHeader.split(' ')[1]);
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) return res.sendStatus(401);

	jwt.verify(token, 'secretKey', (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
}

module.exports = authticateToken;
