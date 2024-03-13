const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const userRouters = require('./controller/users');
const todoRouters = require('./controller/todo')

app.use(bodyParser.urlencoded({ extended: true })); // 'urlcoded'를 'urlencoded'로 수정
app.use(bodyParser.json());
app.use('/api/users', userRouters);
app.use('/api/todo', todoRouters);
app.use((req, res, next) => {
    res.setHeader('x-inho-api', '1.0.0');
    next();
})

app.get('/', (req, res) => {
    res.json({ user: 'http://api.example.com/users?page=2' });
});

app.get('/test', (req, res) => {
    res.json({ user: 'http://api.example.com/users?page=3' });
});

app.post('/', (req, res) => {
    res.send('Got a POST request');
});

app.put('/user', (req, res) => {
    res.send('Got a PUT request at /user');
});

app.delete('/user', (req, res) => {
    res.send('Got a DELETE request at /user');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});