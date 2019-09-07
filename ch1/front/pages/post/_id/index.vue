<template>
  <v-container v-if="post">
    <post-card :post="post" />
  </v-container>
  <div v-else>
    게시글이 존재하지 않습니다.
  </div>  
</template>

<script>
import PostCard from '~/components/PostCard';

export default {
  components: {
    PostCard,
  },
  computed: {
    post() {
      return this.$store.state.posts.mainPosts.find( v => v.id === parseInt(this.$route.params.id, 10)); 
      //params type은 string, 파일이 _name이라면 this.$route.params.name
    }
  }
}
</script>

<style scoped>

</style>