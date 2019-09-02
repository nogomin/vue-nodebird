export const state = () => ({
  me: null,
  followerList: [],
  followingList: [],
  hasMoreFollower: true,
  hasMoreFollowing: true,
});

const totalFollowers = 8;
const totalFollowings = 6;
const limit = 3;

export const mutations = {
  setMe(state, payload) {
    state.me = payload;
  },
  changeNickname(state, payload) {
    state.me.nickname = payload.nickname;
  },
  addFollower(state, payload) {
    state.followerList.push(payload);
  },
  addFollowing(state, payload) {
    state.followingList.push(payload);
  },
  removeFollower(state, payload) {
    const index = state.followerList.findIndex(v=> v.id === payload.id);
    state.followerList.splice(index, 1);
  },
  removeFollowing(state, payload) {
    const index = state.followingList.findIndex(v=> v.id === payload.id);
    state.followingList.splice(index, 1);
  },
  loadFollowings(state) {
    const diff = totalFollowings - state.followingList.length;
    const fakeUsers = Array(diff > limit ? limit: diff).fill().map(v => ({
      id: Math.random().toString(),
      nickname: Math.floor(Math.random() * 1000),
    }));
    state.followingList = state.followingList.concat(fakeUsers);
    state.hasMoreFollowing = fakeUsers.length === limit;
  },
  loadFollowers(state) {
    const diff = totalFollowers - state.followerList.length;
    const fakeUsers = Array(diff > limit ? limit: diff).fill().map(v => ({
      id: Math.random().toString(),
      nickname: Math.floor(Math.random() * 1000),
    }))
    state.followerList = state.followerList.concat(fakeUsers);
    state.hasMoreFollower = fakeUsers.length === limit;
  },
}

export const actions = {
  async loadUser({ state, commit }) {
    console.log('loadUser');
    try {
      const res = await this.$axios.get('/user', {
        withCredentials: true,
      });
      console.log(res.data);
      commit('setMe', res.data);
      console.log(state);
    } catch (err) {
      console.error(err);
    }
  },
  signUp({ commit, state }, payload) {
    this.$axios.post('http://localhost:3085/user', {
      email: payload.email,
      nickname: payload.nickname,
      password: payload.password,
    }, {
      withCredentials: true, // 서버가 서로 다를경우 쿠키전송을 위한 옵션값
    })
    .then((res) => {
      commit('setMe', res.data);
    })
    .catch((err) => {
      console.error(err);
    });
  },
  logIn({ commit }, payload) {
    this.$axios.post('http://localhost:3085/user/login', {
      email: payload.email,
      password: payload.password,
    }, {
      withCredentials: true, // 서버가 서로 다를경우 쿠키전송을 위한 옵션값
    })
    .then((res) => {
      commit('setMe', res.data);
    })
    .catch((err) => {
      console.error(err);
    });
  },
  logOut({ commit }) {
    this.$axios.post('http://localhost:3085/user/logout', {}, {
      withCredentials: true, // 서버가 서로 다를경우 쿠키전송을 위한 옵션값
    })
    .then((data) => {
      commit('setMe', null);
    })
    .catch((err) => {
      console.error(err);
    });
  },
  changeNickname({ commit }, payload) {
    commit('changeNickname', payload);
  },
  addFollowing({ commit }, payload) {
    commit('addFollowing', payload);
  },
  addFollower({ commit }, payload) {
    commit('addFollower', payload);
  },
  removeFollowing({ commit }, payload) {
    commit('removeFollowing', payload);
  },
  removeFollower({ commit }, payload) {
    commit('removeFollower', payload);
  },
  loadFollowers({ commit, state }, payload) {
    if (state.hasMoreFollower) {
      commit('loadFollowers');
    }
  },
  loadFollowings({ commit, state }, payload) {
    if (state.hasMoreFollowing) {
      commit('loadFollowings');
    }
  }
}