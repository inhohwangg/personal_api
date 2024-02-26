const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const userRouters = require('./controller/users');

app.use(bodyParser.urlencoded({ extended: true })); // 'urlcoded'를 'urlencoded'로 수정
app.use(bodyParser.json());
app.use('/users', userRouters);

app.get('/', (req, res) => {
    res.json({ user: 'http://api.example.com/users?page=2' });
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

app.listen(port, () => { // 'list'를 'listen'으로 수정
  console.log(`Example app listening on port ${port}`);
});