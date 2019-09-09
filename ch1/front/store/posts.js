import Vue from 'vue';

export const state = () => ({
  mainPosts: [],
  hasMorePost: true,
  imagePaths: [],
});

//virtualized list : vue-virtual-scroll-list 가져다 쓸것.
//const totalPosts = 51;
//const limit = 10;

export const mutations = {
  addMainPost(state, payload) {
    state.mainPosts.unshift(payload);
    state.imagePaths = [];
  },
  removeMainPost(state, payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.postId);
    state.mainPosts.splice(index, 1);
  },
  loadComments(state, payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.postId);
    //state.mainPosts[index].Comments = payload.data; <-- 반응성이 깨져버리는 코드
    Vue.set(state.mainPosts[index], 'Comments', payload.data);
  },
  addComment(state, payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.PostId);
    state.mainPosts[index].Comments.unshift(payload);
  },
  loadPosts(state, payload) {
    state.mainPosts = state.mainPosts.concat(payload);
    state.hasMorePost = payload.length === 10;
  },
  concatImagePaths(state, payload) {
    state.imagePaths = state.imagePaths.concat(payload); //사용자가 변심으로 추가로 이미지를 등록하는 경우를 위한 concat처리
  },
  removeImagePaths(state, payload) {
    state.imagePaths.splice(payload, 1);
  }
};

export const actions = {
  add({ commit, state }, payload) {
    this.$axios.post('http://localhost:3085/post', {
      content: payload.content,
      image: state.imagePaths,
    }, {
      withCredentials: true,
    })
      .then((res) => {
        commit('addMainPost', res.data); //commit('addMainPost', payload, { root: true}) 하면 index.js에 있는 addMainPost matations함수 호출
      })
      .catch((err) => {
        console.err(err);
      });
  },
  remove({ commit}, payload) {
    this.$axios.delete(`http://localhost:3085/post/${payload.postId}`, {
      withCredentials: true,
    })
      .then(() => {
        commit('removeMainPost', payload.postId);
      })
      .catch(() => {

      })
  },
  addComment({ commit }, payload) {
    this.$axios.post(`http://localhost:3085/post/${payload.postId}/comment`, {
      content: payload.content,
    }, {
      withCredentials: true,
    })
      .then((res) => {
        commit('addComment', res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  },
  loadComments({ commit }, payload) {
    this.$axios.get(`http://localhost:3085/post/${payload.postId}/comments`)
      .then((res) => {
        commit('loadComments', {
          postId: payload.postId,
          data: res.data,
        });
      })
      .catch((err) => {
        console.error(err);
      })
  },
  async loadPosts({ commit, state }, payload) {
    if (state.hasMorePost) {
      try {
        const res = await this.$axios.get(`http://localhost:3085/posts?offset=${state.mainPosts.length}&limit=10`)
        commit('loadPosts', res.data);
        //console.log(state);
        return;
      } catch(err) {
        console.error(err);
      }
    }
  },
  uploadImages({ commit }, payload) {
    this.$axios.post('http://localhost:3085/post/images', payload, {
      withCredentials: true,
    })
      .then((res) => {
        commit('concatImagePaths', res.data);
      })
      .catch((err) => {
        console.error(err);
      })
  }
};