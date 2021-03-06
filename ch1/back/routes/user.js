const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/', isLoggedIn, async(req, res, next) => {
  const user = req.user;
  console.log('back user', user);
  res.json(user);
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      where: { id: parseInt(req.params.id, 10) },
      include: [{
        model: db.Post,
        as: 'Posts',
        attributes: ['id'],
      }, {
        model: db.User,
        as: 'Followings',
        attributes: ['id'],
      }, {
        model: db.User,
        as: 'Followers',
        attributes: ['id'],
      }],
      attributes: ['id', 'nickname'],
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    next(err);
  }
});


router.post('/', isNotLoggedIn, async (req, res, next) => { // app.js에 app.use('/user', usersRouter); <-- 이부분과 주소가 합쳐지므로 /user를 붙이지 말것
  try {
    const hash = await bcrypt.hash(req.body.password, 12); //숫자가 높을수록 보안성 향상, 단 느려짐.. 12가 적당
    const exUser = await db.User.findOne({
      where: {
        email: req.body.email,
      }
    });
    if (exUser) {
      return res.status(403).json({ //return 반드시 적기, 안적으면 can't set Headers after they are sent 에러 발생
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

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    if (info) {
      console.log(info);
      return res.status(401).send(info.reason);
    }
    return req.login(user, async (err) => { //세션에다 사용자 정보 저장 ( 어떻게? serializeUser)
      if (err) {
        console.error(err);
        return next(err);
      }
      return res.json(user); //front로 사용자정보 넘겨주기 [body] , req.login에서 쿠키를 [header]에 심어준다
    }); // passport.initialize()에서 실행된 req.login 메서드임
  })(req, res, next);
});

router.post('/logout', isLoggedIn, (req, res) => {
  if (req.isAuthenticated()) {
    req.logout();
    req.session.destroy(); // 선택사항
    return res.status(200).send('로그아웃 되었습니다.');
  }
});

module.exports = router;