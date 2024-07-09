const admin = require('firebase-admin')
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const router = express.Router();
const pool = require("../dbConnection");
const { v4: uuidv4 } = require('uuid')

app.use(bodyParser.json())

admin.initializeApp({
    credential: admin.credential.cert('./serviceAccountKey.json'),
})

router.get('/status', async (req, res) => {
    res.status(200).json({status:200,message: 'push-notification api is work!'})
})

router.post('/save-token', async (req, res) => {
    try {
        const { userName, fcmToken } = req.body;
        const id = uuidv4();

        //* userName 과 fcmToken 이 모두 일치하는 경우 체크 
        const checkQuery = `SELECT _id FROM push_noti WHERE username = $1 AND fcmtoken = $2`;
        const checkValues = [userName, fcmToken]
        const checkResult = await pool.query(checkQuery, checkValues);
        if (checkResult.rows.length === 0) {
            if (checkResult.rows.length > 0) {
                //* userName 이 존재하는 경우 , 기존의 레코드의 fcmToken 업데이트
                const updateQuery = 'UPDATE push_noti SET fcmtoken = $2 WHERE username = $1'
                const updateValues = [userName, fcmToken]
                await pool.query(updateQuery, updateValues);

                res.status(200).send('Token updated')
            } else {
                //* userName 이 존재하지 않는 경우, 새로운 레코드 추가
                const insertQuery = 'INSERT INTO push_noti (_id, username, fcmtoken) VALUES ($1,$2,$3)'
                const insertValues = [id, userName, fcmToken]
                await pool.query(insertQuery, insertValues);

                res.status(200).send('Token saved')
            }
        } else {
            res.status(200).send('Token already exists')
        }
    } catch (e) {
        res.status(500).send('Token Save Failed')
        console.log('/api/save-token error', e)
    }
})

router.post('/send-notification', async (req, res) => {
    const { userName, title, body } = req.body

    try {
        const query = `SELECT fcmtoken FROM push_noti WHERE username = $1`
        const values = [userName]

        const result = await pool.query(query, values)
        const tokens = result.rows.map(row => row.fcmtoken)

        if (tokens.length === 0) {
            return res.status(400).send('No token found')
        }

        const message = {
            Notification: {
                title: title,
                body: body
            },
            tokens: tokens
        }

        admin.messaging().sendMulticast(message)
            .then((response) => {
                console.log('Successfully sent message:', response);
                res.status(200).send('Push notification sent successfully')
            })
            .catch((error) => {
                console.error('Error sending message:', error);
                res.status(500).send('Error sending push notification')
            })

    } catch (e) {
        res.status(500).send('Error querying database')
        console.log('/api/send-notification error', e)
    }
})

module.exports = router;