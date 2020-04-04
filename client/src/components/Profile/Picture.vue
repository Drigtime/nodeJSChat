<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-toolbar-title>Changer de photo de profile</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-file-input
          :rules="[rules.avatar]"
          accept="image/png, image/jpeg, image/bmp"
          placeholder="Choisisez une photo de profile"
          prepend-icon="mdi-camera"
          label="Photo de profile"
          show-size
          @change="previewPicture"
        ></v-file-input>
        <template v-if="image != null">
          <div class="text-center" style="overflow-x: hidden;">
            <img :src="image.target.result" alt="Image de profile" height="200" />
          </div>
          <v-btn color="primary" block @click="submit">Valider</v-btn>
        </template>
      </v-form>
    </v-card-text>
    <v-snackbar v-model="snackbar" top color="success">
      Image de profile mit à jour
      <v-btn dark text @click="snackbar = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  name: "Picture",
  data: () => ({
    snackbar: false,
    valid: true,
    file: null,
    image: null,
    rules: {
      avatar: value =>
        !value ||
        value.size < 2000000 ||
        "La taille de l'avatar doit être inférieur à 2 MB!"
    }
  }),
  methods: {
    previewPicture(file) {
      if (file) {
        console.log("previewPicture -> file", file);
        this.file = file;
        const reader = new FileReader();

        reader.onload = res => {
          this.image = res;
        };

        reader.readAsDataURL(file);
      } else {
        this.file = null;
        this.image = null;
      }
    },
    submit() {
      if (this.$refs.form.validate()) {
        const formData = new FormData();
        formData.append("avatar", this.file);

        const config = {
          headers: {
            "content-type": "multipart/form-data"
          }
        };

        console.log("submit -> this.file", this.file);
        console.log("submit -> formData", formData);

        axios.post("/api/profile/upload/avatar", formData, config).then(() => {
          this.snackbar = true;
        });
      }
    }
  }
};
</script>

<style></style>
