const pool = require('../dbConnection')


const create = async (tableName, columns, values, res) => {
	const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ')
	const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`

	try {
		const result = await pool.query(query, values)
		return result
	} catch (e) {
		console.log(`${tableName} 생성 실패`, e)
		return res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요' })
	}
}

module.exports = { create }