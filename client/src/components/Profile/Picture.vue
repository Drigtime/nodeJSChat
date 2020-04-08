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
        <div v-if="image || user.avatar" class="text-center" style="overflow-x: hidden;">
          <v-img
            :src="image ? image.target.result : `/api/profile/avatar/${user.avatar}`"
            max-height="100"
            contain
          >
            <template v-slot:placeholder>
              <v-skeleton-loader type="image"></v-skeleton-loader>
            </template>
          </v-img>
        </div>
        <v-btn v-if="image" color="primary" block @click="submit">Valider</v-btn>
        <v-btn v-else-if="user.avatar" color="error" block @click="remove">Supprimer</v-btn>
      </v-form>
    </v-card-text>
    <v-snackbar v-model="snackbar" top color="success">
      {{ snackbarText }}
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
  name: "Picture",
  data: () => ({
    snackbarText: "",
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
  computed: mapGetters(["user"]),
  methods: {
    ...mapActions(["fetchUser"]),
    previewPicture(file) {
      if (file) {
        console.log("previewPicture -> file", file);
        this.file = file;
        const reader = new FileReader();

        reader.onload = res => {
          const image = new Image();
          image.src = event.target.result;

          image.onload = img => {
            let maxWidth = 100,
              maxHeight = 100,
              imageWidth = image.width,
              imageHeight = image.height;

            if (imageWidth > imageHeight) {
              if (imageWidth > maxWidth) {
                imageWidth *= maxHeight / imageHeight;
                imageHeight = maxHeight;
              }
            } else if (imageHeight > imageWidth) {
              if (imageHeight > maxHeight) {
                imageHeight *= maxWidth / imageWidth;
                imageWidth = maxWidth;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = imageWidth;
            canvas.height = imageHeight;
            image.width = imageWidth;
            image.height = imageHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img.target, 0, 0, imageWidth, imageHeight);

            // Convert the resize image to a new file to post it.
            this.file = (function(dataURL) {
              const BASE64_MARKER = ";base64,";
              if (dataURL.indexOf(BASE64_MARKER) == -1) {
                const parts = dataURL.split(",");
                const contentType = parts[0].split(":")[1];
                const raw = parts[1];

                return new Blob([raw], { type: contentType });
              }

              const parts = dataURL.split(BASE64_MARKER);
              const contentType = parts[0].split(":")[1];
              const raw = window.atob(parts[1]);
              const rawLength = raw.length;

              const uInt8Array = new Uint8Array(rawLength);

              for (let i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
              }

              return new Blob([uInt8Array], { type: contentType });
            })(canvas.toDataURL(file.type));
          };

          this.image = res;
        };

        reader.readAsDataURL(file);
      } else {
        this.file = null;
        this.image = null;
      }
    },
    remove() {
      axios
        .delete(`/api/profile/upload/avatar/${this.user.avatar}`)
        .then(() => {
          this.snackbarText = "Image de profile supprimé";
          this.snackbar = true;
          this.fetchUser();
        });
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

        axios.post("/api/profile/upload/avatar", formData, config).then(() => {
          this.snackbarText = "Image de profile mit à jour";
          this.snackbar = true;
          this.image = null;
          this.fetchUser();
        });
      }
    }
  }
};
</script>

<style></style>
