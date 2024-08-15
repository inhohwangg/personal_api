const pool = require('../dbConnection')

/// 생성
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

/// 전체 조회
const fullGet = async (tableName) => {
	const query = `SELECT * FROM ${tableName}`

	try {
		const result = await pool.query(query)
		return result
	} catch (e) {
		console.log(`${tableName} 조회 실패`, e)
		return res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요' })
	}
}

/// 특정 _id 조회
const someGet = async (tableName, column, value, res) => {
	const query = `SELECT * FROM ${tableName} WHERE ${column} = $1`

	try {
		const result = await pool.query(query, [value])
		return result
	} catch (e) {
		console.log(`${tableName} 조회 실패` + e)
		return res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요' })
	}
}

/// 수정
const dataEdit = async (tableName, columns, values, conditionColumn, conditionValue) => {
	let query;
	let result;

	try {
		if (Array.isArray(columns) && columns.length > 1) {
			const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
			query = `UPDATE ${tableName} SET ${setClause}, updated_at = $${columns.length + 1} WHERE ${conditionColumn} = $${columns.length + 2} RETURNING *`;
			result = await pool.query(query, [...values, new Date(), conditionValue]);
		} else if (typeof columns === 'string' || (Array.isArray(columns) && columns.length === 1)) {
			// columns가 문자열일 경우 또는 columns 배열이 하나의 요소만 가질 경우
			const singleColumn = Array.isArray(columns) ? columns[0] : columns;
			query = `UPDATE ${tableName} SET ${singleColumn} = $1, updated_at = $2 WHERE ${conditionColumn} = $3 RETURNING *`;
			result = await pool.query(query, [values, new Date(), conditionValue]);
		} else {
			throw new Error('올바르지 않은 columns 인자입니다.');
		}

		return result;
	} catch (e) {
		console.log(`${tableName} 업데이트 실패`, e);
		throw e; // 에러를 다시 throw하여 상위 함수에서 처리할 수 있도록 함
	}
}


/// 삭제
const remove = async (tableName, column, value) => {
	const query = `DELETE FROM ${tableName} WHERE ${column}=$1 RETURNING *`

	try {
		const result = await pool.query(query, [value])
		return result
	} catch (e) {
		console.log(`${tableName} 삭제 실패` + e)
		res.status(500).json({ statusCode: 500, message: '서버 에러임', content: '관리자에게 문의해주세요' })
	}
}

module.exports = { create, fullGet, someGet, remove, dataEdit }