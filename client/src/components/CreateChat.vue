<template>
  <v-dialog v-model="dialog" max-width="450px">
    <template v-slot:activator="{ on }">
      <v-btn color="primary" block dark v-on="on">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Créer un chat</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="chatName" autofocus label="Nom du chat" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="dialog = false">Fermer</v-btn>
        <v-btn color="primary" dark @click="newChat">Créer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
// import io from "socket.io-client";
import { mapActions } from "vuex";

// const socket = io();

export default {
  data: () => ({
    dialog: false,
    chatName: ""
  }),
  props: {
    socket: Object
  },
  methods: {
    ...mapActions(["fetchUser"]),
    newChat() {
      axios
        .post(
          "/api/chat/",
          { name: this.chatName },
          {
            contentType: "application/json"
          }
        )
        .then(() => {
          this.dialog = false;
          this.fetchUser();
          // socket.emit("create-chat", {
          //   chatId: res.data._id
          // });
        });

      this.chatName = "";
    }
  }
};
</script>