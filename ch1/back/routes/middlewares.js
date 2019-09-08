exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).send('로그인이 필요합니다.');
}

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return res.status(401).send('로그인한 사람은 할 수 없습니다.');
}

//exports하고 module.exports 하면 exports들이 다 덮어쓰기 된다. module.exports가 우선권이 높다
//module.exports 사용하고 싶으면  module.exports = { isLoggedIn : (req, res, next) => {}, isNotLoggedIn : (req,res,next) => {} } 처럼 사용