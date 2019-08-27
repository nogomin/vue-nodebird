module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', { // 테이블명 : posts
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    charset: 'utf8mb4', //mb4는 이모티콘도 허용해줌
    collate: 'utf8mb4_general_ci',
  });

  Post.associate = (db) => {
    db.Post.belongsTo(db.User);
    db.Post.hasMany(db.Comment);
  };

  return Post;
}