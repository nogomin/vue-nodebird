<template>
  <div style="margin-bottom: 20px;">
    <v-card>
      <post-images :images="post.Images || []"/>
      <v-card-title>
        <div>
          <h3>
            <nuxt-link :to="'/user/' + post.id">{{post.User.nickname}}</nuxt-link>
          </h3>
        </div>
      </v-card-title>
      <v-card-text>
        <div>
          <h3>{{post.content}}</h3>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn text color="orange">
          <v-icon>mdi-twitter-retweet</v-icon>
        </v-btn>
        <v-btn text color="orange">
          <v-icon>mdi-heart-outline</v-icon>
        </v-btn>
        <v-btn text color="orange" @click="onToggleComment">
          <v-icon>mdi-comment-outline</v-icon>
        </v-btn>
        <v-menu offset-y open-on-hover>
          <template v-slot:activator="{on}">
            <v-btn text color="orange" v-on="on">
              <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>
          <div style="background: white">
            <v-btn dark color="red" @click="onRemovePost">삭제</v-btn>
            <v-btn text color="orange" @click="onEditPost">수정</v-btn>
          </div>
        </v-menu>
      </v-card-actions>
    </v-card>
    <template v-if="commentOpened">
      <comment-form :post-id="post.id" />
      <v-list>
        <v-list-item v-for="c in post.Comments" :key="c.id">
          <v-list-item-avatar color="teal">
            <span>{{c.User.nickname[0]}}</span>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{c.User.nickname}}</v-list-item-title>
            <v-list-item-subtitle>{{c.content}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </div>
</template>

<script>
import CommentForm from '~/components/CommentForm';
import PostImages from '~/components/PostImages';

export default {
  components: {
    CommentForm,
    PostImages,
  },
  props: { // props는 최대한 자세히 써준다.
    post: {
      type: Object,
      required: true, // 부모가 필수적으로 넘겨줘야함을 의미
    },
  },
  data() {
    return {
      commentOpened: false,
    }
  },
  methods: {
    onRemovePost() {
      this.$store.dispatch('posts/remove', {
        postId: this.post.id,
      })
    },
    onEditPost() {

    },
    onToggleComment() {
      if (!this.commentOpened) {
        this.$store.dispatch('posts/loadComments', {
          postId: this.post.id,
        });
      }
      this.commentOpened = !this.commentOpened;
    }
  }

};
</script>

<style scoped>
  a {
    color: inherit;
    text-decoration: none;
  }
</style>