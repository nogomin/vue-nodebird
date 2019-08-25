const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../models');

const router = express.Router();

router.post('/');

router.post('/', async (req, res, next) => { // app.js에 app.use('/user', usersRouter); <-- 이부분과 주소가 합쳐지므로 /user를 붙이지 말것
  try {
    const hash = await bcrypt.hash(req.body.password, 12); //숫자가 높을수록 보안성 향상, 단 느려짐.. 12가 적당
    const exUser = await db.User.findOne({
      where: {
        email: req.body.email,
      }
    });
    if (exUser) {
      return res.status(403).json({
        errorCode: 1, //임의로 정하는 에러코드
        messsage: '이미 회원가입 된 이메일입니다.'
      })
    }
    const newUser = await db.User.create({
      email: req.body.email,
      password: hash,
      nickname: req.body.nickname,
    });
    return res.status(201).json(newUser); // HTTP STATUS CODE : 200은 그냥 성공, 201은 성공적으로 생성됐다는 의미
  } catch(err) {
    console.log(err);
    return next(err);
  }
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (err) => { //세션에다 사용자 정보 저장 ( 어떻게? serializeUser)
      if (err) {
        console.error(err);
        return next(err);
      }
      return res.json(user); //front로 사용자정보 넘겨주기
    }); // passport.initialize()에서 실행된 req.login 메서드임
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  if (req.isAuthenticated()) {
    req.logout();
    req.session.destroy(); // 선택사항
    return res.status(200).send('로그아웃 되었습니다.');
  }
});

module.exports = router;