<template>
  <v-dialog v-model="dialog" max-width="450px">
    <template v-slot:activator="{ on }">
      <v-btn color="primary" block dark v-on="on">
        <v-icon>mdi-account-plus</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Ajouter un utilisateur</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-select
                v-if="chat !== null"
                v-model="selectedUsers"
                :items="getUsers"
                item-text="name"
                item-value="_id"
                label="Utilisateur à ajouter"
                multiple
                chips
                required
              ></v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="dialog = false">Fermer</v-btn>
        <v-btn color="primary" dark @click="inviteToChat">Ajouter</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
// import io from "socket.io-client";
import { mapGetters } from "vuex";

// const socket = io();

export default {
  props: {
    users: {
      type: Array,
      default: function() {
        return [];
      }
    },
    chat: {
      type: Object,
      default: function() {
        return {};
      }
    },
    socket: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data: () => ({
    dialog: false,
    selectedUsers: []
  }),
  computed: {
    ...mapGetters(["user"]),
    getUsers() {
      return this.users.filter(user => user._id !== this.chat.owner);
    }
  },
  mounted() {},
  methods: {
    inviteToChat() {
      axios
        .post(
          "/api/chat/user/add",
          { chatId: this.chat._id, users: this.selectedUsers },
          {
            contentType: "application/json"
          }
        )
        .then(() => {
          this.socket.emit("add-user-to-chat", {
            users: this.selectedUsers,
            chat: this.chat
          });
          this.dialog = false;
        });
    }
  }
};
</script>
