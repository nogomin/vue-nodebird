const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

const db = require('./models');
const app = express();

db.sequelize.sync();

app.use(cors('http://localhost:3000'));
app.use(express.json()); // json을 body로 받을수 있게함 (json parser)

app.get('/', (req, res) => {
  res.send('안녕 test');
});

app.post('/user', async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 12); //숫자가 높을수록 보안성 향상, 단 느려짐.. 12가 적당
    const newUser = await db.User.create({
      email: req.body.email,
      password: hash,
      nickname: req.body.nickname,
    });
    res.status(201).json(newUser); // HTTP STATUS CODE : 200은 그냥 성공, 201은 성공적으로 생성됐다는 의미
  } catch(err) {
    console.log(err);
    next(err);
  }
})

app.listen(3085, () => {
  console.log(`backend server ${3085}번 포트에서 작동중`);
});