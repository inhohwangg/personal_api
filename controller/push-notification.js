const admin = require('firebase-admin')
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const router = express.Router();
const pool = require("../dbConnection");
const { v4: uuidv4 } = require('uuid')
const { google } = require('googleapis')
const path = require('path')
const axios = require('axios');
require('dotenv').config();

app.use(bodyParser.json())

const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.PROJECTID
});

app.use(bodyParser.json());

router.get('/status', async (req, res) => {
    res.status(200).json({ status: 200, message: 'push-notification api is working!' });
});

//* userName , fcmToken 저장
router.post('/save-token', async (req, res) => {
    try {
        const { userName, fcmToken, serviceLabel } = req.body;
        const id = uuidv4();
        console.log('Received save-token request with datas:', req.body)

        // FCM 토큰이 존재하는지 확인
        const checkQuery = `SELECT _id FROM push_noti WHERE fcmtoken = $1`;
        const checkValues = [fcmToken];
        const checkResult = await pool.query(checkQuery, checkValues);

        if (checkResult.rows.length === 0) {
            // FCM 토큰이 존재하지 않으면 새로운 레코드 추가
            const insertQuery = 'INSERT INTO push_noti (_id, username, fcmtoken, serviceLabel) VALUES ($1, $2, $3, $4)';
            const insertValues = [id, userName, fcmToken, serviceLabel];
            await pool.query(insertQuery, insertValues);
            console.log('Inserted new token with serviceLabel: ', serviceLabel)

            res.status(200).send('Token saved');
        } else {
            // const updateQuery = 'UPDATE push_noti SET username=$1 WHERE fcmtoken=$2';
            const updateQuery = 'UPDATE push_noti SET username=$1, serviceLabel=$3 WHERE fcmtoken=$2';
            const updateValues = [userName, fcmToken,serviceLabel];
            await pool.query(updateQuery, updateValues);
            console.log('Updated token with serviceLabel: ', serviceLabel)
            res.status(200).send('Token already exists');
        }
    } catch (e) {
        res.status(500).send('Token Save Failed');
        console.log('/save-token error', e);
    }
});

//* 특정 사용자에게 알람 보내기 
router.post('/send-notification', async (req, res) => {
    const { serviceLabel, title, body } = req.body;
    console.log('Received send-notification request with serviceLabel:', serviceLabel)

    try {
        const query = `SELECT fcmtoken FROM push_noti WHERE serviceLabel = $1`;
        const values = [serviceLabel];

        const result = await pool.query(query, values);
        const tokens = result.rows.map(row => row.fcmtoken);

        if (tokens.length === 0) {
            console.log('No token found for serviceLabel: ', serviceLabel)
            return res.status(400).send('No token found');
        }

        const message = {
            notification: {
                title: title,
                body: body,
            },
            android: {
                priority: 'high',
                notification: {
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                },
            },
            apns: {
                headers: {
                    'apns-priority': '10',
                },
                payload: {
                    aps: {
                        alert: {
                            title: title,
                            body: body,
                        },
                    },
                },
            },
            tokens: tokens,
        };

        console.log(message)

        admin.messaging().sendMulticast(message)
            .then((response) => {
                console.log(response);

                // 에러 상세 내용 출력
                if (response.failureCount > 0) {
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
                        }
                    });
                }

                if (response.successCount > 0) {
                    console.log(`Successfully sent message: ${response.successCount} messages sent`);
                    res.status(200).send('Push notification sent successfully');
                } else {
                    console.error('Failed to send any messages:', response);
                    res.status(500).send('Failed to send push notification');
                }
            })
            .catch((error) => {
                console.error('Error sending message:', error);
                res.status(500).send('Error sending push notification');
            });

    } catch (e) {
        res.status(500).send('Error querying database');
        console.log('/send-notification error', e);
    }
});


//* 전체 사용자에게 알림 보내기 
router.post('/send-notifications', async (req, res) => {
    try {
        const tokens = await getAllTokens();

        if (tokens.length === 0) {
            return res.status(400).send('No tokens found');
        }

        const message = {
            notification: {
                title: 'New Notification',
                body: 'You have a new notification',
            },
            android: {
                priority: 'high',
                notification: {
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                },
            },
            apns: {
                headers: {
                    'apns-priority': '10',
                },
                payload: {
                    aps: {
                        alert: {
                            title: 'New Notification',
                            body: 'You have a new notification',
                        },
                    },
                },
            },
            tokens: tokens, // 여러 토큰을 포함하는 배열
        };

        const response = await admin.messaging().sendMulticast(message);
        console.log(response);
        if (response.successCount > 0) {
            console.log('푸시 알림을 성공적으로 보냈습니다.');
            res.status(200).json({ message: '푸시 알림 성공' });
        } else {
            console.log('푸시 알림을 실패했습니다.');
            res.status(500).json({ message: '푸시 알림 실패' });
        }
    } catch (e) {
        console.log('Error sending notification:', e);
        res.status(500).json({ message: 'Failed to send notification' });
    }
});

async function getAllTokens() {
    try {
        const result = await pool.query('SELECT fcmtoken FROM push_noti');
        return result.rows.map(row => row.fcmtoken);
    } catch (error) {
        console.log('getAllTokens error', error);
        return [];
    }
}

async function getAccessToken() {
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    const keyFile = require(keyPath);
    const client = new google.auth.JWT(
        keyFile.client_email, null, keyFile.private_key,
        ['https://www.googleapis.com/auth/firebase.messaging']
    );
    await client.authorize();
    return client.credentials.access_token;
}

async function sendPush(tokens) {
    const accessToken = await getAccessToken();

    try {
        // 메시지 객체를 생성합니다.
        const message = {
            notification: {
                title: 'New Notification',
                body: 'You have a new notification',
            },
            android: {
                priority: 'high',
                notification: {
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                },
            },
            apns: {
                headers: {
                    'apns-priority': '10',
                },
                payload: {
                    aps: {
                        alert: {
                            title: 'New Notification',
                            body: 'You have a new notification',
                        },
                    },
                },
            },
            tokens: tokens, // 여러 토큰을 포함하는 배열
        };

        // sendEachForMulticast 호출
        const response = await admin.messaging().sendMulticast(message);
        console.log(response)
        if (response.successCount > 0) {
            console.log('푸시 알림을 성공적으로 보냈습니다.');
        } else {
            console.log('푸시 알림을 실패했습니다.');
        }
    } catch (e) {
        if (e.response) {
            console.log('Response data:', e.response.data);
            console.log('Response status:', e.response.status);
            console.log('Response headers:', e.response.headers);
        } else if (e.request) {
            console.log('Request data:', e.request);
        } else {
            console.log('Error message:', e.message);
        }
        console.log('Error config:', e.config);
    }
}



module.exports = router;