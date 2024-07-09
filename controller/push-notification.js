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
    res.status(200).json({ status: 200, message: 'push-notification api is work!' })
})

//* userName , fcmToken 저장
router.post('/save-token', async (req, res) => {
    try {
        const { userName, fcmToken } = req.body;
        const id = uuidv4();

        //* userName 과 fcmToken 이 모두 일치하는 경우 체크 
        const checkQuery = `SELECT _id FROM push_noti WHERE username = $1 AND fcmtoken = $2`;
        const checkValues = [userName, fcmToken]
        const checkResult = await pool.query(checkQuery, checkValues);

        if (checkResult.rows.length === 0) {
            const userCheckQuery = `SELECT _id FROM push_noti WHERE username = $1`;
            const userCheckValues = [userName];
            const userCheckResult = await pool.query(userCheckQuery, userCheckValues);

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

//* 특정 사용자에게 알람 보내기 
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


//* 전체 사용자에게 알림 보내기 
router.post('/send-notifications', async (req, res) => {
    try {
        const tokens = await getAllTokens()
        await sendPush(tokens);
        res.sendStatus(200).json({ message: '푸시 알림 성공' })
    } catch (error) {
        console.error('Error sending notification :', error)
        res.status(500).json({ message: 'Failed to send notification' })
    }
})

async function getAllTokens() {
    try {
        const result = await pool.query(`SELECT fcmtoken FROM push_noti`)
        return result.rows.map(row => row.fcmtoken);
    } catch (error) {
        console.log('getAllTokens error', error);
        return [];
    }
}

async function getAccessToken() {
    // 실제로 OAuth 2.0 Access Token을 가져오는 로직을 여기에 구현하세요.
    return 'your_access_token';
  }

async function sendPush(tokens) {
    const accessToken = await getAccessToken()

    tokens.forEach(async (token) => {
        try {
            const res = await axios.post(
                'https://fcm.googleapis.com/v1/projects/gractorapp/messages:send',
                {
                    message: {
                        notification: {
                            title: 'New Notification',
                            body: `You have a new notification`
                        },
                        android: {
                            priority: 'high',
                            notification: {
                                click_action: 'FLUTTER_NOTIFICATION_CLICK'
                            },
                        },
                        apns: {
                            header: {
                                'apns-priority': '10'
                            },
                            payload: {
                                aps: {
                                    alert: {
                                        title: 'New Notification',
                                        body: `You have a new notification`
                                    }
                                }
                            },
                        },
                        token,
                    },
                    header: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
            if (response.status === 200) {
                console.log(`Push notification sent successfully to ${token}`);
            } else {
                console.error(`Failed to send push notification to ${token}`);
            }
        } catch (e) {
            console.log('sendPush error', e);
        }
    })
}


module.exports = router;