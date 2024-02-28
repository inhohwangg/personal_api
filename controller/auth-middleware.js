const jwt = require('jsonwebtoken')

const authticateToken = (req, res, next) => {
	const authHeader = req.headers['x-viewtrack-token'];
	// console.log(authHeader);
	// const token = authHeader && authHeader.split(' ')[1];
	if (!authHeader) return res.sendStatus(401);

	jwt.verify(authHeader, 'secretKey', (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
}

module.exports = authticateToken;
