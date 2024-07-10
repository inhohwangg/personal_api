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

app.use(bodyParser.json())


admin.initializeApp({
    credential: admin.credential.cert('./controller/serviceAccountKey.json'),
});

app.use(bodyParser.json());

router.get('/status', async (req, res) => {
    res.status(200).json({ status: 200, message: 'push-notification api is working!' });
});

//* userName , fcmToken 저장
router.post('/save-token', async (req, res) => {
    try {
        const { userName, fcmToken } = req.body;
        const id = uuidv4();

        //* userName 과 fcmToken 이 모두 일치하는 경우 체크 
        const checkQuery = `SELECT _id FROM push_noti WHERE username = $1 AND fcmtoken = $2`;
        const checkValues = [userName, fcmToken];
        const checkResult = await pool.query(checkQuery, checkValues);

        if (checkResult.rows.length === 0) {
            const userCheckQuery = `SELECT _id FROM push_noti WHERE username = $1`;
            const userCheckValues = [userName];
            const userCheckResult = await pool.query(userCheckQuery, userCheckValues);

            console.log('User Check Result:', userCheckResult.rows);

            if (userCheckResult.rows.length > 0) {
                //* userName 이 존재하는 경우 , 기존의 레코드의 fcmToken 업데이트
                const updateQuery = 'UPDATE push_noti SET fcmtoken = $2 WHERE username = $1';
                const updateValues = [userName, fcmToken];
                await pool.query(updateQuery, updateValues);

                res.status(200).send('Token updated');
            } else {
                //* userName 이 존재하지 않는 경우, 새로운 레코드 추가
                const insertQuery = 'INSERT INTO push_noti (_id, username, fcmtoken) VALUES ($1, $2, $3)';
                const insertValues = [id, userName, fcmToken];
                await pool.query(insertQuery, insertValues);

                res.status(200).send('Token saved');
            }
        } else {
            res.status(200).send('Token already exists');
        }
    } catch (e) {
        res.status(500).send('Token Save Failed');
        console.log('/save-token error', e);
    }
});

// //* 특정 사용자에게 알람 보내기 
// router.post('/send-notification', async (req, res) => {
//     const { userName, title, body } = req.body;

//     try {
//         const query = `SELECT fcmtoken FROM push_noti WHERE username = $1`;
//         const values = [userName];

//         const result = await pool.query(query, values);
//         const tokens = result.rows.map(row => row.fcmtoken);

//         console.log('Tokens:', tokens);

//         if (tokens.length === 0) {
//             return res.status(400).send('No token found');
//         }

//         const message = {
//             notification: {
//                 title: title,
//                 body: body,
//             },
//             tokens: tokens,
//         };

//         admin.messaging().sendEachForMulticast(message)
//             .then((response) => {
//                 res.status(200).send('Push notification sent successfully');
//             })
//             .catch((error) => {
//                 console.error('Error sending message:', error);
//                 res.status(500).send('Error sending push notification');
//             });

//     } catch (e) {
//         res.status(500).send('Error querying database');
//         console.log('/send-notification error', e);
//     }
// });

// //* 전체 사용자에게 알림 보내기 
// router.post('/send-notifications', async (req, res) => {
//     try {
//         const tokens = await getAllTokens();

//         if (tokens.length === 0) {
//             return res.status(400).send('No tokens found');
//         }

//         await sendPush(tokens);

//         res.status(200).json({ message: '푸시 알림 성공' });
//     } catch (error) {
//         console.error('Error sending notification:', error);
//         res.status(500).json({ message: 'Failed to send notification' });
//     }
// });


// async function getAllTokens() {
//     try {
//         const result = await pool.query('SELECT fcmtoken FROM push_noti');
//         return result.rows.map(row => row.fcmtoken);
//     } catch (error) {
//         console.log('getAllTokens error', error);
//         return [];
//     }
// }

// async function getAccessToken() {
//     const keyPath = path.join(__dirname, 'serviceAccountKey.json');
//     const keyFile = require(keyPath);
//     const client = new google.auth.JWT(
//         keyFile.client_email, null, keyFile.private_key,
//         ['https://www.googleapis.com/auth/firebase.messaging']
//     );
//     await client.authorize();
//     // console.log('Access Token:', client.credentials.access_token);
//     return client.credentials.access_token;
// }

// async function sendPush(tokens) {
//     const accessToken = await getAccessToken(); // getAccessToken 함수 사용

//     try {
//         const res = await axios.post(
//             'https://fcm.googleapis.com/v1/projects/gractorapp/messages:send',
//             {
//                 message: {
//                     notification: {
//                         title: 'New Notification',
//                         body: 'You have a new notification',
//                     },
//                     android: {
//                         priority: 'high',
//                         notification: {
//                             click_action: 'FLUTTER_NOTIFICATION_CLICK',
//                         },
//                     },
//                     apns: {
//                         headers: {
//                             'apns-priority': '10',  // 숫자가 아닌 문자열로 설정
//                         },
//                         payload: {
//                             aps: {
//                                 alert: {
//                                     title: 'New Notification',
//                                     body: 'You have a new notification',
//                                 },
//                             },
//                         },
//                     },
//                 },
//                 token: tokens  // 여러 토큰을 보낼 때 사용
//             },
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//             }
//         );

//         if (res.status === 200) {
//             console.log('푸시 알림을 성공적으로 보냈습니다.');
//         } else {
//             console.log('푸시 알림을 실패했습니다.');
//         }
//     } catch (e) {
//         if (e.response) {
//             // 서버 응답이 있는 경우
//             console.log('Response data:', e.response.data);
//             console.log('Response status:', e.response.status);
//             console.log('Response headers:', e.response.headers);
//         } else if (e.request) {
//             // 요청이 만들어졌으나 서버로부터 응답이 없는 경우
//             console.log('Request data:', e.request);
//         } else {
//             // 요청을 설정하는 도중에 오류가 발생한 경우
//             console.log('Error message:', e.message);
//         }
//         console.log('Error config:', e.config);
//     }
// }

//* 특정 사용자에게 알람 보내기 
router.post('/send-notification', async (req, res) => {
    const { userName, title, body } = req.body;

    try {
        const query = `SELECT fcmtoken FROM push_noti WHERE username = $1`;
        const values = [userName];

        const result = await pool.query(query, values);
        const tokens = result.rows.map(row => row.fcmtoken);

        console.log('Tokens:', tokens);

        if (tokens.length === 0) {
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

        admin.messaging().sendEachForMulticast(message)
            .then((response) => {
                res.status(200).send('Push notification sent successfully');
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

        await sendPush(tokens);

        res.status(200).json({ message: '푸시 알림 성공' });
    } catch (error) {
        console.error('Error sending notification:', error);
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
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(response.data)
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