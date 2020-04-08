<template>
  <v-card class="elevation-12 mx-auto my-5" max-width="500px">
    <v-toolbar color="primary" dark flat>
      <v-toolbar-title>Formulaire d'inscription</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form ref="registerForm" v-model="valid">
        <v-text-field
          v-model="username"
          label="Nom d'utilisateur"
          name="username"
          prepend-icon="mdi-account"
          type="text"
          required
          @keypress.enter="register"
        />
        <v-text-field
          v-model="email"
          label="Email"
          name="email"
          prepend-icon="mdi-at"
          type="email"
          :rules="emailRules"
          required
          @keypress.enter="register"
        />
        <v-text-field
          v-model="password1"
          label="Mot de passe"
          name="password1"
          prepend-icon="mdi-lock"
          type="password"
          :rules="passwordRules"
          @keypress.enter="register"
        />
        <v-text-field
          v-model="password2"
          label="Confirmer le mot de passe"
          name="password2"
          prepend-icon="mdi-lock"
          type="password"
          :rules="[...passwordRules, ...confirmPasswordRule]"
          @keypress.enter="register"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn text to="/login" color="primary">Déjà inscrit ?</v-btn>
      <v-spacer />
      <v-btn color="primary" @click="register">S'inscrire</v-btn>
    </v-card-actions>
    <v-snackbar v-model="snackbar" top>
      {{ snackbarText }}
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
      username: "",
      email: "",
      emailRules: [
        v => !!v || "L'adresse mail est requise",
        v => /.+@.+/.test(v) || "L'adresse mail doit être valide"
      ],
      password1: "",
      password2: "",
      passwordRules: [
        v => !!v || "Le mot de passe est requis",
        v =>
          v.length >= 6 ||
          "Le mot de passe doit être plus grand que 6 caractères"
      ],
      confirmPasswordRule: [
        () =>
          this.password2 === this.password1 ||
          "Les mots de passe ne correspondent pas."
      ]
    };
  },
  methods: {
    ...mapActions(["fetchUser"]),
    register() {
      if (this.$refs.registerForm.validate()) {
        const config = {
          headers: {
            "Content-Type": "application/json"
          }
        };

        axios
          .post(
            "/api/users",
            {
              name: this.username,
              email: this.email,
              password: this.password1
            },
            config
          )
          .then(async res => {
            localStorage.setItem("token", res.data.token);
            setAuthToken(localStorage.token);
            await this.fetchUser();
            this.$router.push({ path: "chat" });
          })
          .catch(err => {
            console.log("register -> err.response.data", err.response.data);
            this.snackbarText = err.response.data.errors[0].msg;
            this.snackbar = true;
          });
      }
    }
  }
};
</script>
