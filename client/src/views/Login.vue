<template>
  <v-card class="elevation-12 mx-auto my-5" max-width="400px">
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>Connexion</v-toolbar-title>
      <!-- <v-spacer /> -->
    </v-toolbar>
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
      <v-btn text to="/register" color="primary">Créer un compte</v-btn>
      <v-spacer />
      <v-btn color="primary" @click="login">Connexion</v-btn>
    </v-card-actions>
    <v-snackbar v-model="snackbar" top>
      Les identifiants ne sont pas corrects
      <v-btn color="pink" text @click="snackbar = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-card>
</template>

<script>
import setAuthToken from "../utils/setAuthToken";
import { mapActions } from "vuex";
import axios from "axios";

export default {
  data() {
    return {
      snackbar: false,
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
            setAuthToken(localStorage.token);
            await this.fetchUser();
            this.$router.push({ path: "chat" });
          })
          .catch(() => {
            this.snackbar = true;
          });
      }
    }
  }
};
</script>
