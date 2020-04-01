<template>
  <v-dialog v-model="dialog" max-width="450px">
    <template v-slot:activator="{ on }">
      <v-list-item v-on="on">
        <v-list-item-avatar>
          <v-icon>mdi-pencil</v-icon>
        </v-list-item-avatar>
        <v-list-item-title>Renommer le chat</v-list-item-title>
      </v-list-item>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Renommer le chat</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="name" autofocus label="Nom du chat" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="dialog = false">Fermer</v-btn>
        <v-btn color="primary" dark @click="renameChat">Renommer</v-btn>
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
  props: {
    socket: Object,
    chatId: String,
    chatName: String
  },
  data: () => ({
    dialog: false,
    name: ""
  }),
  created() {
    this.name = this.chatName;
  },
  methods: {
    ...mapActions(["fetchUser"]),
    renameChat() {
      axios
        .post(
          "/api/chat/rename",
          { chatId: this.chatId, name: this.name },
          {
            contentType: "application/json"
          }
        )
        .then(() => {
          this.dialog = false;
          //   this.fetchUser();
          this.socket.emit("rename-chat", { chatId: this.chatId });
        });

      //   this.name = "";
    }
  }
};
</script>
