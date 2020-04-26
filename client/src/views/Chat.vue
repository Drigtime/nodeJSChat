<template>
  <div class="d-flex" style="height: calc(100vh - 48px)">
    <div style="height: 100%">
      <v-navigation-drawer permanent width="200px">
        <v-skeleton-loader v-if="user === null" type="list-item"></v-skeleton-loader>
        <v-list v-else dense nav style="overflow-y: auto;">
          <v-list-item
            v-for="(chat, index) in user.chats"
            :key="index"
            link
            @click="switchChat(chat.chat._id)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ chat.chat.name }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action
              v-if="chat.chat._id === globalChatId && chat.chat.owner === user._id"
            >
              <v-menu>
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on">
                    <v-icon>mdi-dots-horizontal</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <rename-chat
                    :chat-id="chat.chat._id"
                    :chat-name="chat.chat.name"
                    :socket="socket"
                  ></rename-chat>
                  <v-list-item @click="deleteChat(chat.chat._id)">
                    <v-list-item-avatar>
                      <v-icon color="error">mdi-delete</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-title class="red--text">Supprimer le chat</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>
            <v-list-item-action v-else-if="chat.chat._id !== globalChatId">
              <v-menu>
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on">
                    <v-icon>mdi-dots-horizontal</v-icon>
                  </v-btn>
                </template>
                <!-- Owner menu -->
                <v-list v-if="chat.chat.owner == user._id">
                  <rename-chat
                    :chat-id="chat.chat._id"
                    :chat-name="chat.chat.name"
                    :socket="socket"
                  ></rename-chat>
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
      <v-toolbar color="grey darken-4" dark dense>
        <v-toolbar-title>
          <v-skeleton-loader v-if="loadingChat || chat === null" width="300" type="heading"></v-skeleton-loader>
          <span v-else>{{ chat.name }}</span>
        </v-toolbar-title>

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
          <div id="chatContent" style="overflow-x: hidden; height: 100%;">
            <v-list v-if="loadingChat">
              <v-skeleton-loader type="list-item-avatar-two-line" v-for="i in 3" :key="i"></v-skeleton-loader>
            </v-list>

            <v-list v-else two-line subheader>
              <template v-for="(message, index) in messages">
                <v-list-item :key="index" class="message">
                  <v-list-item-avatar>
                    <v-img
                      :src="message.user.avatar ? `/api/profile/avatar/${message.user.avatar}` : message.user.gravatar"
                    >
                      <template v-slot:placeholder>
                        <v-skeleton-loader type="avatar"></v-skeleton-loader>
                      </template>
                    </v-img>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title v-html="message.user.name"></v-list-item-title>
                    <v-list-item-subtitle v-if="isBeingEdited != message._id">
                      <v-img v-if="message.attach" :src="message.attach" max-height="300" contain></v-img>
                      <div class="text--primary message-wrap">{{ message.text }}</div>
                    </v-list-item-subtitle>
                    <v-text-field v-else dense v-model="editedMessage">
                      <template v-slot:append>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              icon
                              color="error"
                              @click="isBeingEdited = '', editedMessage = ''"
                            >
                              <v-icon v-on="on">mdi-close</v-icon>
                            </v-btn>
                          </template>
                          Annuler
                        </v-tooltip>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on }">
                            <v-btn icon color="success" @click="editMessage">
                              <v-icon v-on="on">mdi-check</v-icon>
                            </v-btn>
                          </template>
                          Modifié
                        </v-tooltip>
                      </template>
                    </v-text-field>
                  </v-list-item-content>

                  <v-list-item-action
                    v-if="message.user._id == user._id && isBeingEdited != message._id"
                    class="my-auto"
                  >
                    <v-menu left>
                      <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          @click="isBeingEdited = message._id, editedMessage = message.text"
                        >
                          <v-list-item-icon>
                            <v-icon>mdi-pencil</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title>Modifier le message</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteMessage(message._id)">
                          <v-list-item-icon>
                            <v-icon class="red--text">mdi-delete</v-icon>
                          </v-list-item-icon>
                          <v-list-item-title class="red--text">Supprimer le message</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </v-list-item>
              </template>
            </v-list>
          </div>
          <v-card v-if="newMessageAttach">
            <v-container fluid>
              <v-row justify="center">
                <v-col cols="4" style="text-align: end">
                  <v-btn
                    color="error"
                    fab
                    x-small
                    dark
                    style="position: absolute; z-index: 1; margin-left: -16px; margin-top: -16px;"
                    @click="newMessageAttach = null"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <v-img :src="newMessageAttach"></v-img>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
          <v-textarea
            auto-grow
            rows="1"
            v-model="newMessage"
            placeholder="Message ..."
            hide-details
            solo
            @keydown="handleMessageTextField"
            @paste="handlePasteTextField"
          >
            <template v-slot:append>
              <v-menu offset-y top left :close-on-content-click="false">
                <template v-slot:activator="{ on: menu }">
                  <v-tooltip top>
                    <template v-slot:activator="{ on: tooltip }">
                      <v-btn icon color="primary" dark v-on="{ ...tooltip, ...menu }">
                        <v-icon>mdi-emoticon</v-icon>
                      </v-btn>
                    </template>
                    <span>Emoji</span>
                  </v-tooltip>
                </template>
                <v-card height="348">
                  <v-tabs show-arrows fixed-tabs v-model="emojiTab" style="max-width: 273px;">
                    <v-tab
                      v-for="(tab, i) in emojisCategories"
                      :key="i"
                      style="min-width: unset;"
                    >{{ emojis[tab][0].emoji }}</v-tab>
                  </v-tabs>
                  <v-tabs-items
                    v-model="emojiTab"
                    style="max-width: 273px; max-height: 300px; overflow-y: scroll;"
                  >
                    <v-tab-item
                      :transition="false"
                      :reverse-transition="false"
                      v-for="(tab, i) in emojisCategories"
                      :key="i"
                    >
                      <button
                        class="btnEmoji"
                        v-for="(emoji, index) in emojis[tab]"
                        :key="index"
                        @click="addEmojiToMessage(emoji.emoji)"
                      >{{ emoji.emoji }}</button>
                    </v-tab-item>
                  </v-tabs-items>
                </v-card>
              </v-menu>
              <v-tooltip top>
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn icon color="primary" dark v-on="tooltip" @click="send">
                    <v-icon>mdi-send</v-icon>
                  </v-btn>
                </template>
                <span>Envoyer</span>
              </v-tooltip>
            </template>
          </v-textarea>
        </div>
        <v-navigation-drawer
          v-model="userDrawer"
          :style="userDrawer ? '' : 'display: none'"
          right
          permanent
          width="200px"
        >
          <v-list v-if="loadingChat">
            <v-skeleton-loader type="list-item-avatar" v-for="i in 3" :key="i"></v-skeleton-loader>
          </v-list>
          <v-list v-else dense nav>
            <v-list-item v-for="userOfChat in usersList" :key="userOfChat._id" link>
              <v-list-item-avatar tile>
                <v-badge
                  overlap
                  bordered
                  bottom
                  :color="userOfChat.connected ? 'green' : 'grey'"
                  dot
                  offset-x="10"
                  offset-y="10"
                >
                  <v-avatar size="40">
                    <v-img
                      :src="userOfChat.avatar ? `/api/profile/avatar/${userOfChat.avatar}` : userOfChat.gravatar"
                    >
                      <template v-slot:placeholder>
                        <v-skeleton-loader type="avatar"></v-skeleton-loader>
                      </template>
                    </v-img>
                  </v-avatar>
                </v-badge>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ userOfChat.name }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action class="d-flex flex-row align-center">
                <v-menu v-if="userOfChat._id !== user._id" left>
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
                      <v-list-item-title>Envoyer un message</v-list-item-title>
                    </v-list-item>
                    <v-list-item
                      v-if="chat.owner == user._id"
                      @click="removeFromChat(userOfChat._id)"
                    >
                      <v-list-item-avatar>
                        <v-icon color="error">mdi-account-off</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-title class="red--text">Exclure</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <template v-if="chat && chat.owner == user._id" v-slot:append>
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
import emojiJSON from "../assets/emoji.json";

import InviteUser from "../components/InviteUser";
import CreateChat from "../components/CreateChat";
import RenameChat from "../components/RenameChat";

const socket = io();

export default {
  name: "Chat",
  components: {
    InviteUser,
    CreateChat,
    RenameChat
  },
  data() {
    return {
      emojiTab: null,
      emojisCategories: Object.keys(emojiJSON),
      emojis: emojiJSON,
      userDrawer: true,
      globalChatId: "5e7a67e7e0470653ac237e87",
      newMessage: "",
      newMessageAttach: null,
      editedMessage: null,
      isBeingEdited: "",
      error: false,
      loadingChat: false,
      chat: null,
      messages: [],
      users: [],
      connectedUsers: [],
      allUsers: []
    };
  },
  computed: {
    ...mapGetters(["user"]),
    usersList() {
      if (this.chat) {
        return this.chat.users.map(chatUser => {
          const userIndex = this.connectedUsers.findIndex(
            user => user._id === chatUser.user._id
          );
          if (userIndex !== -1) {
            return { ...chatUser.user, connected: true };
          } else {
            return { ...chatUser.user, connected: false };
          }
        });
      } else return {};
    },
    socket: () => socket
  },
  mounted() {
    const $vm = this;

    // Get all existing users for the invite select
    axios
      .get("/api/users/all")
      .then(res => {
        this.allUsers = res.data;
      })
      .then(() => {
        this.loading = false;
      });

    if (this.user) {
      socket.emit("new-connection", this.user);

      this.switchChat(this.user.chats[0].chat._id);
    }

    socket.on("chat-message", message => {
      this.messages.push(message);
    });

    socket.on("edited-message", message => {
      const msgIndex = this.messages.findIndex(msg => msg._id == message._id);

      this.messages[msgIndex].text = message.text;
    });

    socket.on("deleted-message", message => {
      const msgIndex = this.messages.findIndex(msg => msg._id == message._id);

      this.messages.splice(msgIndex, 1);
    });

    socket.on("update-user-data", () => {
      this.fetchUser();
    });

    socket.on("added-user-to-chat", () => {
      $vm.updateUsers();
    });

    socket.on("removed-from-a-chat", () => {
      this.switchChat(this.globalChatId);
      this.fetchUser();
    });

    socket.on("user-quitted-chat", () => {
      $vm.updateUsers();
    });

    socket.on("quitted-chat", () => {
      this.fetchUser();
    });

    socket.on("new-connection", users => {
      this.connectedUsers = users;
    });
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
    handlePasteTextField(event) {
      // use event.originalEvent.clipboard for newer chrome versions
      const items = (event.clipboardData || event.originalEvent.clipboardData)
        .items;
      console.log(JSON.stringify(items)); // will give you the mime types
      // find pasted image among pasted items
      let blob = null;
      for (const item of items) {
        if (item.type.indexOf("image") === 0) {
          blob = item.getAsFile();
        }
      }
      // load image if there is a pasted image
      if (blob !== null) {
        const reader = new FileReader();
        reader.onload = event => {
          console.log(event.target.result); // data url!
          this.newMessageAttach = event.target.result;
          // document.getElementById("pastedImage").src = event.target.result;
        };
        reader.readAsDataURL(blob);
      }
    },
    handleMessageTextField(event) {
      if (event.keyCode == 13 && !event.shiftKey) {
        event.preventDefault();
        if (this.newMessage.replace(/\n/g, "").length > 0) {
          this.send();
        }
      }
    },
    addEmojiToMessage(emoji) {
      this.newMessage = this.newMessage + emoji;
    },
    send() {
      const msg = this.newMessage.match(/^[\s\S]*?([\w\d\S][\s\S]*)/)[1];
      const msgAttach = this.newMessageAttach;
      this.newMessage = "";
      this.newMessageAttach = null;
      axios
        .post(
          `/api/message/${this.chat._id}`,
          { text: msg, attach: msgAttach },
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
    editMessage() {
      const message = this.messages.find(msg => msg._id == this.isBeingEdited);

      axios
        .put(
          `/api/message/${this.isBeingEdited}`,
          { text: this.editedMessage },
          {
            contentType: "application/json"
          }
        )
        .then(res => {
          this.editedMessage = "";
          this.isBeingEdited = "";
          socket.emit("edited-message", {
            chat: message.chat,
            message: res.data
          });
        });
    },
    deleteMessage(msgId) {
      const message = this.messages.find(msg => msg._id == msgId);

      axios.delete(`/api/message/${message._id}`).then(() => {
        socket.emit("deleted-message", { chat: message.chat, message });
      });
    },
    disconnect() {
      document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
      window.location.replace("/auth");
    },
    switchChat(chatId) {
      console.log(this.chat);

      this.loadingChat = true;
      this.loading = true;

      axios.get(`/api/chat/${chatId}`).then(res => {
        const oldChat = this.chat;
        this.chat = res.data;
        this.users = res.data.users;
        this.messages = res.data.messages.map(data => data.message);

        this.loadingChat = false;
        this.loading = false;

        socket.emit("switch-chat", {
          oldChat: oldChat,
          newChat: this.chat
        });
      });
    },
    removeFromChat(userId) {
      axios
        .post(
          "/api/chat/user/remove",
          {
            chatId: this.chat._id,
            userId
          },
          {
            contentType: "application/json"
          }
        )
        .then(() => {
          socket.emit("remove-user-from-chat", {
            chatId: this.chat._id,
            userId
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
        .then(() => {
          socket.emit("quit-chat", {
            chatId
          });
          this.switchChat(this.globalChatId);
        });
    },
    deleteChat(chatId) {
      axios.delete(`/api/chat/${chatId}`).then(
        socket.emit("delete-chat", {
          chatId
        })
      );
    },
    updateUsers() {
      axios.get(`/api/chat/${this.chat._id}`).then(res => {
        this.chat = res.data;
        this.users = res.data.users;
        this.messages = res.data.messages.map(data => data.message);
      });
    }
  }
};
</script>

<style>
.message > .v-list-item__action {
  display: none;
}

.message {
  cursor: default;
}

.message:hover > .v-list-item__action {
  display: block;
}

.message:hover {
  background-color: #0000000a;
}

.message-wrap {
  white-space: pre-wrap;
}

.v-textarea.v-text-field--solo .v-input__append-inner {
  margin-top: 8px !important;
}

/* .v-list--two-line .v-list-item .v-list-item__subtitle,
.v-list-item--two-line .v-list-item__subtitle {
  -webkit-line-clamp: unset;
} */

.v-list--two-line .v-list-item .v-list-item__subtitle,
.v-list-item--two-line .v-list-item__subtitle {
  white-space: unset;
}

.v-list-item__title,
.v-list-item__subtitle {
  overflow: unset;
}

.btnEmoji {
  width: 32px;
  height: 32px;
  outline: none;
}

.btnEmoji:hover {
  background-color: #00000010;
}

.btnEmoji:active {
  background-color: #0000001f;
}
</style>
