<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-toolbar-title>Changer de mot de passe</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          v-model="currentPassword"
          :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[...rules.password]"
          :type="show1 ? 'text' : 'password'"
          name="current-password"
          label="Mot de passe actuel"
          hint="Au moins 6 caractères"
          @click:append="show1 = !show1"
        ></v-text-field>
        <v-text-field
          v-model="confirmPassword1"
          :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[...rules.password]"
          :type="show2 ? 'text' : 'password'"
          name="current-password"
          label="Nouveau mot de passe"
          hint="Au moins 6 caractères"
          @click:append="show2 = !show2"
        ></v-text-field>
        <v-text-field
          v-model="confirmPassword2"
          :append-icon="show3 ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[...rules.password, rules.confirmPassword]"
          :type="show3 ? 'text' : 'password'"
          name="current-password"
          label="Confirmer le nouveau mot de passe"
          hint="Au moins 6 caractères"
          @click:append="show3 = !show3"
        ></v-text-field>
        <v-btn color="primary" block @click="submit">Valider</v-btn>
      </v-form>
    </v-card-text>
    <v-snackbar v-model="snackbar" top :color="snackbarColor">
      {{ snackbarText }}
      <v-btn dark text @click="snackbar = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  name: "Password",
  data() {
    return {
      snackbar: false,
      snackbarText: "",
      snackbarColor: "",
      valid: true,
      show1: false,
      show2: false,
      show3: false,
      currentPassword: "",
      confirmPassword1: "",
      confirmPassword2: "",
      rules: {
        password: [
          v => !!v || "Le mot de passe est requis",
          v =>
            v.length >= 6 ||
            "Le mot de passe doit être plus grand que 6 caractères"
        ],
        confirmPassword: () =>
          this.confirmPassword1 === this.confirmPassword2 ||
          "Les mots de passe ne correspondent pas."
      }
    };
  },
  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        axios
          .post(
            "/api/profile/edit/password",
            {
              password: this.currentPassword,
              newPassword: this.confirmPassword1
            },
            {
              contentType: "application/json"
            }
          )
          .then(() => {
            this.snackbar = true;
            this.snackbarText = "Mot de passe modifié";
            this.snackbarColor = "success";
          })
          .catch(err => {
            this.snackbar = true;
            this.snackbarText = err.response.data.msg;
            this.snackbarColor = "error";
          });
      }
    }
  }
};
</script>

<style></style>
