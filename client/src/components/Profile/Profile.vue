<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-toolbar-title>Editer le profile</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field ref="nameField" name="pseudo" label="Pseudo" :value="user.name"></v-text-field>
        <v-btn color="primary" block @click="submit">Valider</v-btn>
      </v-form>
    </v-card-text>
    <v-snackbar v-model="snackbar" top color="success">
      Pseudo modifié
      <v-btn dark text @click="snackbar = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-card>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Profile",
  data() {
    return {
      snackbar: false,
      valid: true
    };
  },
  computed: mapGetters(["user"]),
  methods: {
    ...mapActions(["fetchUser"]),
    submit() {
      if (this.$refs.form.validate()) {
        axios
          .post(
            "/api/profile/edit/name",
            {
              name: this.$refs.nameField.lazyValue
            },
            {
              contentType: "application/json"
            }
          )
          .then(() => {
            this.snackbar = true;
            this.fetchUser();
          });
      }
    }
  }
};
</script>

<style></style>
