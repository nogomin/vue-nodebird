const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const passport = require('passport');
const session = require('express-session');
const cookie = require('cookie-parser');
const morgan = require('morgan');

const db = require('./models');
const passportConfig = require('./passport');
const userRouter = require('./routes/user');
const app = express();

db.sequelize.sync({force: true}); // force 하면 디비 스키마 변경한 내용이 반영된다. 실무 배포에선 절대안됨. 마이그레이션 이용할것
passportConfig();

app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, //쿠키를 받을수 있도록 설정
}));
app.use(express.json()); // json을 body로 받을수 있게함 (json parser)
app.use(express.urlencoded({ extended: false }));
app.use(cookie('cookiesecret'));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'cookiesecret',
  cookie: {
    httpOnly: true,
    secure: false,
  }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.status(200).send('안녕 test');
});

app.use('/user', userRouter);

app.post('/post', (req, res) => {
  if (req.isAuthenticated()) {

  }
})

app.listen(3085, () => {
  console.log(`backend server ${3085}번 포트에서 작동중`);
});