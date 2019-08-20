export const state = () => ({
  mainPosts: [],
});


export const mutations = {
  addMainPost(state, payload) {
    state.mainPosts.unshift(payload);
  },
  removeMainPost(state, payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.id);
    state.mainPosts.splice(index, 1);
  },
  addComment(state, payload) {
    const index = state.mainPosts.findIndex(v => v.id === payload.postId);
    state.mainPosts[index].Comments.unshift(payload);
  }
};

export const actions = {
  add({ commit }, payload) {
    commit('addMainPost', payload); //commit('addMainPost', payload, { root: true}) 하면 index.js에 있는 addMainPost matations함수 호출
  },
  remove({ commit}, payload) {
    commit('removeMainPost', payload);
  },
  addComment({ commit }, payload) {
    commit('addComment', payload);
  }
};