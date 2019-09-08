const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../models');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({ //file storage(e.g AWS S3) 쓰기 전까지 uploads 폴더에 저장
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
    const hashtags = req.body.content.match(/#[^\s#]+/g);
    const newPost = await db.Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if (hashtags) {
     const result = await Promise.all(hashtags.map(tag => db.Hashtag.findOrCreate({ //await 안쓰고 map을 쓴경우 promise가 배열형태로 되어있음
        where: { name: tag.slice(1).toLowerCase() },
      })));
      await newPost.addHashtags(result.map(r => r[0])); //addHashtags()는 시퀄라이즈가 관계설정할때 생기는 메서드
      //db.sequelize.query('SELECT * FROM ...') <-- 쿼리 직접작성 가능
    }
    const fullPost = await db.Post.findOne({
      where: { id: newPost.id },
      include: [{ // 관계 파악
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

router.delete('/:id', async (req, res, next) => {
  try {
    await db.Post.destroy({
      where: {
        id: req.params.id,
      }, 
    });
    res.send('삭제했습니다.');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/:id/comments', async (req, res, next) => {
  try {
    const post = await db.Post.findOne({
      where: { id: req.params.id}
    });
    if (!post) {
      return res.status(404).send('포스트가 존재하지 않습니다.');
    }
    const comments = await db.Comment.findAll({
      where: {
        PostId: req.params.id,
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }],
      order: [['createdAt', 'ASC']], //2차원 배열인거 조심..
    });
    res.json(comments);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/:id/comment', isLoggedIn, async (req, res, next) => {
  try {
    const post = await db.Post.findOne({
      where: { id: req.params.id}
    });
    if (!post) {
      return res.status(404).send('포스트가 존재하지 않습니다.');
    }
    const newComment = await db.Comment.create({
      PostId: post.id,
      UserId: req.user.id,
      content: req.body.content,
    });
    //await post.addComment(newComment.id); <-- DB를 2번 요청해서 비효율
    const comment = await db.Comment.findOne({
      where : {
        id: newComment.id,
      },
      include: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }]
    });
    return res.json(comment);
  } catch (err) {
    next(err);
  }
})

module.exports = router;
