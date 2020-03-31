<template>
  <v-menu
    v-model="menu"
    offset-y
    origin="top left"
    :close-on-content-click="false"
    :nudge-width="200"
  >
    <template v-slot:activator="{ on }">
      <v-btn dark outlined v-on="on">
        Login
      </v-btn>
    </template>

    <v-card>
      <v-card-text>
        <v-form ref="loginForm" v-model="valid">
          <v-text-field
            v-model="email"
            label="E-mail"
            name="email"
            prepend-icon="mdi-account"
            :rules="emailRules"
            required
            @keypress.enter="login"
          />
          <v-text-field
            v-model="password"
            label="Mot de passe"
            name="password"
            prepend-icon="mdi-lock"
            type="password"
            :rules="passwordRules"
            required
            @keypress.enter="login"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <router-link to="/register" @click.native="menu = false">
          S'inscrire
        </router-link>
        <v-spacer />
        <v-btn
          color="primary"
          @click="
            menu = false;
            login();
          "
        >
          Connexion
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";
import router from '../router'

export default {
  data() {
    return {
      menu: false,
      valid: false,
      email: "",
      emailRules: [
        v => !!v || "L'adresse mail est requise",
        v => /.+@.+/.test(v) || "L'adresse mail doit être valide"
      ],
      password: "",
      passwordRules: [
        v => !!v || "Le mot de passe est requis",
        v =>
          v.length >= 6 ||
          "Le mot de passe doit être plus grand que 6 caractères"
      ]
    };
  },
  methods: {
    ...mapActions(["fetchUser"]),
    login() {
      if (this.$refs.loginForm.validate()) {
        const config = {
          headers: {
            "Content-Type": "application/json"
          }
        };

        axios
          .post(
            "/api/auth",
            {
              email: this.email,
              password: this.password
            },
            config
          )
          .then(async res => {
            console.log(res);

            localStorage.setItem("token", res.data.token);
            await this.fetchUser();
            router.push("/");
          });
      }
    }
  }
};
</script>
