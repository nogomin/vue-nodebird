const passport = require('passport');
const local = require('./local');
const db = require('../models');

module.exports = () => {
  passport.serializeUser( (user, done) => { // 서버의 메모리 절약을 위해 사용자 id만 저장
    return done(null, user.id);
  });
  passport.deserializeUser( async (id, done) => {
    try {
      const user = await db.User.findOne({ 
        where: {id},
        attributes: ['id', 'nickname'],
        include: [{
          model: db.Post,
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
      });
      return done(null, user); // req.user, req.isAuthenticated() === true,
    } catch(err) {
      console.error(err);
      return done(err);
    }
  });
  local();
}