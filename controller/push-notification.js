const admin = require('firebase-admin')
const express = require('express')
const bodyParser = require('body-parser');
const app = express()
app.use(bodyParser.json())

admin.initializeApp({
    credential: admin.credential.cert('./serviceAccountKey.json'),
})

let userTokens = {}

app.post('/api/save-token', (req, res) => {
    try {
        const { userName, fcmToken } = req.body;
        if (!userTokens[userName]) {
            userTokens[userName] = []
        }
        if (!userTokens[userName].includes(fcmToken)) {
            userTokens[userName].push(fcmToken);
        }
        res.status(200).send('Token saved')
    } catch (e) {
        res.status(400).send('Token Save Failed')
        console.log('/api/save-token error', e)
    }
})

app.post('/api/send-notification', (req, res) => {
    const { userName , title , body} = req.body 

    if (!userTokens[userName]) {
        return res.status(400).send('No user found')
    }

    const message = {
        notification: {
            title: title,
            body: body,
        },
        tokens: userTokens[userName]
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
})