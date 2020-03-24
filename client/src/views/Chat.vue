<template>
    <v-container class="pa-0" style="width: 100%; max-width: none">
        <v-row no-gutters style="height: calc(100vh - 96px)">
            <v-col
                cols="2"
                sm="3"
                md="2"
                style="overflow-y: auto; height: 100%"
            >
                <v-card outlined height="100%">
                    <!-- <v-navigation-drawer permanent> -->
                    <!-- <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title class="title">
                            Application
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            subtext
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider> -->

                    <v-list dense nav>
                        <v-list-item
                            link
                            v-for="(chat, index) in user.chats"
                            v-bind:key="index"
                            @click="switchChat(chat.chat._id)"
                        >
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ chat.chat.name }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <!-- <v-list-item link>
                            <v-list-item-content>
                                <v-list-item-title>Test 1</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item> -->
                        <!-- <v-list-item
          v-for="item in items"
          :key="item.title"
          link
        >
          <v-list-item-avatar>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item> -->
                    </v-list>
                    <!-- </v-navigation-drawer> -->
                    <v-btn color="primary" block tile>
                        <v-icon>
                            mdi-plus
                        </v-icon>
                    </v-btn>
                </v-card>
            </v-col>
            <v-col style="overflow-y: auto; height: 100%" id="chatContent">
                <v-card outlined height="100%">
                    <v-list>
                        <v-list-item
                            v-for="(message, index) in messages"
                            v-bind:key="index"
                        >
                            <v-list-item-content>
                                <v-list-item-title>
                                    [{{ message.user.name }}] {{ message.text }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-col>
            <v-col
                cols="2"
                sm="3"
                md="2"
                style="overflow-y: auto; height: 100%"
            >
                <v-card outlined height="100%">
                    <!-- <v-navigation-drawer permanent> -->
                    <v-list dense nav height="89%">
                        <v-list-item
                            link
                            v-for="(user, index) in users"
                            v-bind:key="index"
                            :disabled="user.connected ? false : true"
                        >
                            <v-list-item-avatar>
                                <!-- <v-icon>mdi-account</v-icon> -->
                                <img v-bind:src="user.avatar" alt="" />
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ user.name }}
                                </v-list-item-title>
                            </v-list-item-content>
                            <v-list-item-action>
                                <!-- <v-btn icon> -->
                                <v-icon
                                    :color="user.connected ? 'green' : 'grey'"
                                >
                                    mdi-circle-medium</v-icon
                                >
                                <!-- </v-btn> -->
                            </v-list-item-action>
                        </v-list-item>
                    </v-list>
                    <v-btn color="primary" block tile>
                        <v-icon>
                            mdi-account-plus
                        </v-icon>
                    </v-btn>
                    <!-- </v-navigation-drawer> -->
                </v-card>
            </v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="12">
                <v-text-field
                    label="Outlined"
                    placeholder="Message ..."
                    hide-details
                    solo
                    v-model="newMessage"
                    v-on:keyup.enter="send"
                ></v-text-field>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from "axios";
import io from "socket.io-client";
import { mapGetters } from "vuex";

const socket = io();

export default {
    name: "Chat",
    data() {
        return {
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
    computed: mapGetters(["user"]),
    mounted() {
        const $vm = this;

        axios.get("/api/users/all").then(res => {
            $vm.allUsers = res.data;
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

        socket.on("new-connection", users => {
            // console.log(users);

            // if (users && !$vm.users.map(u => u._id).includes(user._id)) {
            //     $vm.users.push(user);
            // }
            console.log($vm.chat);

            // $vm.users = users;
            if ($vm.chat) {
                $vm.users = $vm.chat.users.map(chatUser => {
                    const userIndex = users.findIndex(
                        user => user._id === chatUser.user
                    );

                    if (userIndex !== -1) {
                        return { ...users[userIndex], connected: true };
                    } else {
                        return {
                            ...$vm.allUsers[
                                $vm.allUsers.findIndex(
                                    user => user._id === chatUser.user
                                )
                            ],
                            connected: false
                        };
                    }
                });
            }
        });

        // socket.on("get-user", () => {
        //     socket.emit("get-user", $vm.user);
        // });
    },
    updated() {
        // if (!this.loadingChat) {
        document.querySelector(
            "#chatContent"
        ).scrollTop = document.querySelector("#chatContent").scrollHeight;
        // }
    },
    methods: {
        send() {
            axios
                .post(
                    `/api/message/${this.chat._id}`,
                    { text: this.newMessage },
                    {
                        contentType: "application/json"
                    }
                )
                .then(res => {
                    // console.log(res);

                    socket.emit("chat-message", {
                        chat: this.chat,
                        message: res.data
                    });
                    this.newMessage = null;
                });
        },
        disconnect() {
            document.cookie =
                "token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
            window.location.replace("/auth");
        },
        newChat() {
            const chatNameInput = document.querySelector("#newChatName");
            const chatName = chatNameInput.value;
            chatNameInput.value = "";

            // this.loading = true;
            axios.post(
                "/api/chat/",
                { name: chatName },
                {
                    contentType: "application/json"
                }
            );
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
        inviteToChat() {
            const userId = document.querySelector("#inviteChatUser").value;

            axios.post(
                "/api/chat/user/add",
                { chatId: this.chat._id, userId },
                {
                    contentType: "application/json"
                }
            );
        }
    }
};
</script>

<style></style>
