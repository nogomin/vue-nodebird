export const state = () => ({
  hello: 'vuex',
});

export const mutations = {};

export const actions = {
  nuxtServerInit({ commit, dispatch, state }, { req }) { // layout에는 fetch함수가 실행안되므로, nuxt의 특수한 함수 활용
    return dispatch('users/loadUser');
  },
};