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
  //console.log(req.files);
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
    if (req.body.image) {
      if (Array.isArray(req.body.image)) { // 한개일때 배열에 안담기는 버그 방지
        await Promise.all(req.body.image.map((image) => {
          return db.Image.create({ src: image, PostId: newPost.id });
          // newPost.addImages(images) <-- 비효율적
        }));
      } else {
        await db.Image.create({ src: req.body.image, PostId: newPost.id });
      }
    }
    const fullPost = await db.Post.findOne({
      where: { id: newPost.id },
      include: [{ // 관계 파악
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Image,
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

router.post('/:id/retweet', isLoggedIn, async( req, res, next) => {
  try {
    const post = await db.Post.findOne({
      where: { id: req.params.id },
      include: [{
        model: db.Post,
        as: 'Retweet', // 리트윗한 게시글이면 원본 게시글이 된다
      }],
    });
    if (!post) {
      return res.status(404).send('포스트가 존재하지 않습니다.');
    }
    if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
      return res.status(403).send('자신의 글은 리트윗할 수 없습니다.');
    }
    const retweetTargetId = post.RetweetId || post.id;
    const exPost = await db.Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    })
    if (exPost) {
      return res.status(403).send('이미 리트윗 했습니다.');
    }
    const retweet = await db.Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: 'retweet', // content는 필수
    });
    const retweetWithPrevPost = await db.Post.findOne({
      where: { id: retweet.id },
      inclued: [{
        model: db.User,
        attributes: ['id', 'nickname'],
      }, {
        model: db.Post,
        as: 'Retweet',
        include: [{
          model: db.User,
          attributes: ['id', 'nickname'],
        }, {
          model: db.Image,
        }]
      }]
    })
    res.json(retweetWithPrevPost);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
