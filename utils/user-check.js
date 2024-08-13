const pool = require('../dbConnection')

const userCheck = async (tableName, column, value, res) => {
	const query = `SELECT * FROM ${tableName} WHERE ${column}=$1`
	try {
		const result = await pool.query(query, [value])
		return result.rows[0]
	} catch (e) {
		console.log(`${tableName} 사용자 조회 실패`, e)
		return res.status(500).json({ statusCode: 500, message: '서버 에러', content: '관리자에게 문의해주세요.' })
	}
}

module.exports = { userCheck }