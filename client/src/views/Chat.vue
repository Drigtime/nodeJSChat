<template>
  <div class="d-flex" style="height: calc(100vh - 48px)">
    <div style="height: 100%">
      <v-navigation-drawer permanent width="200px">
        <v-skeleton-loader v-if="user === null" height="94" type="list-item"></v-skeleton-loader>
        <v-list dense nav style="overflow-y: auto;" v-else>
          <v-list-item
            link
            v-for="(chat, index) in user.chats"
            v-bind:key="index"
            @click="switchChat(chat.chat._id)"
          >
          
            <v-list-item-content>
              <v-list-item-title>{{ chat.chat.name }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on">
                    <v-icon>mdi-dots-horizontal</v-icon>
                  </v-btn>
                </template>
                <!-- Owner menu -->
                <v-list v-if="chat.chat.owner == user._id">
                  <v-list-item>
                    <v-list-item-avatar>
                      <v-icon>mdi-pencil</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title>Renommer le chat</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deleteChat(chat.chat._id)">
                    <v-list-item-avatar>
                      <v-icon color="error">mdi-delete</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title class="red--text">Supprimer le chat</v-list-item-title>
                  </v-list-item>
                </v-list>
                <!-- User menu -->
                <v-list v-else-if="chat.chat._id !== globalChatId">
                  <v-list-item @click="quitChat(chat.chat._id)">
                    <v-list-item-avatar>
                      <v-icon color="error">mdi-close</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title class="red--text">Quitter le chat</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </v-list-item>
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <create-chat :socket="socket"></create-chat>
          </div>
        </template>
      </v-navigation-drawer>
    </div>
    <!-- </v-col> -->
    <!-- <v-col style="overflow-y: auto; height: 100%" id="chatContent"> -->
    <v-card style="width: calc(100% - 200px);">
      <v-skeleton-loader v-if="chat == null" height="94" type="list-item"></v-skeleton-loader>
      <v-toolbar color="grey darken-4" dark dense v-else>
        <v-toolbar-title>{{ chat.name }}</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn icon @click="userDrawer = !userDrawer" v-on="on">
              <v-icon>mdi-account-multiple</v-icon>
            </v-btn>
          </template>
          <span>Liste des membres</span>
        </v-tooltip>
      </v-toolbar>

      <v-card-text class="pa-0 d-flex flex-row" style="height: calc(100% - 48px)">
        <div
          class="d-flex flex-column"
          :style="userDrawer ? 'width: calc(100% - 200px);' : 'width: 100%;'"
        >
          <div style="overflow-x: hidden; height: 100%;" id="chatContent">
            <v-skeleton-loader v-if="loadingChat" height="94" type="list-item"></v-skeleton-loader>
            <v-list v-else>
              <v-list-item v-for="(message, index) in messages" v-bind:key="index">
                <v-list-item-content>
                  <v-list-item-title class="message">[{{ message.user.name }}] {{ message.text }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
          <v-text-field
            label="Outlined"
            placeholder="Message ..."
            hide-details
            solo
            v-model="newMessage"
            v-on:keyup.enter="send"
            mx-2
          ></v-text-field>
        </div>
        <v-navigation-drawer v-model="userDrawer" right permanent width="200px">
          <v-skeleton-loader v-if="loading" height="94" type="list-item-avatar"></v-skeleton-loader>
          <v-list dense nav v-else>
            <v-list-item link v-for="(userOfChat, index) in users" v-bind:key="index">
              <v-list-item-avatar>
                <img v-bind:src="userOfChat.avatar" alt />
              </v-list-item-avatar>
              <v-icon
                :color="userOfChat.connected ? 'green' : 'grey'"
                style="
                        position: absolute;
                        margin-left: 25px;
                        margin-top: 10px;
                    "
              >mdi-circle-medium</v-icon>
              <v-list-item-content>
                <v-list-item-title>{{ userOfChat.name }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action class="d-flex flex-row align-center">
                <v-menu offset-y v-if="userOfChat._id !== user._id">
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item>
                      <v-list-item-avatar>
                        <v-icon>mdi-send</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title>Envoyer un message privée</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="chat.owner == user._id">
                      <v-list-item-avatar>
                        <v-icon color="error">mdi-account-off</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title class="red--text">Bannir l'utilisateur</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <template v-slot:append>
            <div class="pa-2">
              <invite-user :users="allUsers" :chat="chat" :socket="socket"></invite-user>
            </div>
          </template>
        </v-navigation-drawer>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import io from "socket.io-client";
import { mapGetters, mapActions } from "vuex";

import InviteUser from "../components/InviteUser";
import CreateChat from "../components/CreateChat";

const socket = io();

export default {
  name: "Chat",
  data() {
    return {
      userDrawer: true,
      globalChatId: "5e7a67e7e0470653ac237e87",
      newMessage: null,
      error: false,
      loading: true,
      loadingChat: false,
      chat: null,
      messages: [],
      users: [],
      allUsers: []
    };
  },
  components: {
    InviteUser,
    CreateChat
  },
  computed: {
    ...mapGetters(["user"]),
    socket: () => socket
  },
  mounted() {
    const $vm = this;

    axios
      .get("/api/users/all")
      .then(res => {
        $vm.allUsers = res.data;
      })
      .then(() => {
        $vm.loading = false;
      });

    if ($vm.user) {
      $vm.users.push($vm.user);
      socket.emit("new-connection", $vm.user);
      // console.log($vm.user);

      $vm.switchChat($vm.user.chats[0].chat._id);
    }

    socket.on("chat-message", message => {
      $vm.messages.push(message);
    });

    socket.on("chat-deleted", async () => {
      console.log("DELETE");

      await $vm.fetchUser();
    });

    socket.on("added-user-to-chat", users => {
      console.log("ADDED USER TO CHAT");

      axios.get(`/api/chat/${$vm.chat._id}`).then(async res => {
        $vm.chat = res.data;

        $vm.updateUsers(users);
      });
    });

    socket.on("added-to-a-chat", async () => {
      console.log("ADDED TO A CHAT");

      await $vm.fetchUser();
    });

    // socket.on("user-quitted-chat", () => {
    //   console.log("USER QUITTED THE CHAT");

    //   axios.get(`/api/chat/${$vm.chat._id}`).then(async res => {
    //     $vm.chat = res.data;

    //     $vm.updateUsers(users);
    //   });
    // });

    socket.on("quitted-chat", async () => {
      console.log("YOU QUITTED THE CHAT");

      await $vm.fetchUser();
    });

    socket.on("new-connection", users => {
      // console.log(users);

      // if (users && !$vm.users.map(u => u._id).includes(user._id)) {
      //     $vm.users.push(user);
      // }
      console.log($vm.chat);

      // $vm.users = users;
      if ($vm.chat) {
        $vm.updateUsers(users);
      }
    });

    // socket.on("get-user", () => {
    //     socket.emit("get-user", $vm.user);
    // });
  },
  updated() {
    // if (!this.loadingChat) {
    const chatContent = document.querySelector("#chatContent");
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
    // }
  },
  methods: {
    ...mapActions(["fetchUser"]),
    updateUsers(users) {
      this.users = this.chat.users.map(chatUser => {
        const userIndex = users.findIndex(user => user._id === chatUser.user);
        if (userIndex !== -1) {
          return { ...users[userIndex], connected: true };
        } else {
          return {
            ...this.allUsers[
              this.allUsers.findIndex(user => user._id === chatUser.user)
            ],
            connected: false
          };
        }
      });
    },
    send() {
      const msg = this.newMessage;
      this.newMessage = null;
      axios
        .post(
          `/api/message/${this.chat._id}`,
          { text: msg },
          {
            contentType: "application/json"
          }
        )
        .then(res => {
          socket.emit("chat-message", {
            chat: this.chat,
            message: res.data
          });
        });
    },
    disconnect() {
      document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
      window.location.replace("/auth");
    },
    switchChat(chatId) {
      // console.log(chatId);

      this.loadingChat = true;

      axios.get(`/api/chat/${chatId}`).then(res => {
        const oldChat = this.chat;
        this.chat = res.data;
        this.messages = res.data.messages.map(data => data.message);
        this.loadingChat = false;
        socket.emit("switch-chat", {
          oldChat: oldChat,
          newChat: this.chat
        });
      });
    },
    quitChat(chatId) {
      axios
        .post(
          "/api/chat/quit",
          {
            chatId
          },
          {
            contentType: "application/json"
          }
        )
        .then(
          socket.emit("quit-chat", {
            chatId
          })
        );
    },
    deleteChat(chatId) {
      axios.delete(`/api/chat/${chatId}`).then(
        socket.emit("delete-chat", {
          chatId
        })
      );
      // .then(()=>{

      // })
    }
  }
};
</script>

<style>
.message {
  white-space: normal !important;
}
</style>
