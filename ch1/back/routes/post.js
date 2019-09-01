const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../models');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads');
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      done(null, basename + Date.now() + ext);
    }
  }),
  limit: { fileSize: 20 * 1024 * 1024 },
});

router.post('/images', isLoggedIn, upload.array('image'),  (req, res) => {
  //req.files = [ {filename: 1.jpg }, { filename: 2.jpg }]
  console.log(req.files);
  res.json(req.files.map(v => v.filename)); 
});

router.post('/', isLoggedIn,  async (req, res) => {
  try {
    const newPost = await db.Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if (hashtags) {
     const result = await Promise.all(hashtags.map(tag => db.Hashtag.findOrCreate({ //await 안쓰고 map을 쓴경우 promise가 배열형태로 되어있음
        where: { name: tag.slice(1).toLowerCase() },
      })));
      await newPost.addHashtags(result.map(r => r[0]));
      //db.sequelize.query('SELECT * FROM ...') <-- 쿼리 직접작성 가능
    }
    const fullPost = await db.Post.findOne({
      where: { id: newPost.id },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
    });
    return res.json(fullPost);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
