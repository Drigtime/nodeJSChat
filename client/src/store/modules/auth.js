import axios from "axios";
import router from "../../router";

const state = {
  user: undefined
};

const getters = {
  user: state => state.user
};

const actions = {
  async fetchUser({ commit }) {
    const response = await axios.get("/api/auth", {
      headers: {
        "x-auth-token": localStorage.token
      }
    });

    commit("setUser", response.data);
    router.push("/");
  },
  logoutUser({ commit }) {
    localStorage.removeItem("token");

    commit("setUser", undefined);
    router.push("/login");
  }
};

const mutations = {
  setUser: (state, user) => (state.user = user)
};

export default {
  state,
  getters,
  actions,
  mutations
};
