const socket = io();

const app = new Vue({
    el: "#app",
    data: {
        newMessage: null,
        error: false,
        loading: true,
        loadingChat: false,
        user: null,
        chat: null,
        messages: [],
        users: [],
        allUsers: []
    },
    created() {
        $.ajax({
            method: "GET",
            url: "/api/users/all",
            success: res => {
                this.allUsers = res;
            }
        });

        this.loading = true;
        $.ajax({
            method: "GET",
            url: "/api/auth",
            headers: { "x-auth-token": localStorage.token },
            success: res => {
                this.user = res;
                this.users.push(this.user);
                this.loading = false;
                socket.emit("new-connection", this.user);
                this.switchChat(this.user.chats[0].chat._id);
            }
        });

        socket.on("chat-message", message => {
            console.log(message);

            this.messages.push(message);
        });

        socket.on("new-connection", user => {
            console.log(user);
            
            if (!this.users.map(u => u._id).includes(user._id)) {
                this.users.push(user);
            }
        });

        socket.on("get-user", () => {
            socket.emit("get-user", this.user);
        });
    },
    updated() {
        if (!this.loadingChat) {
            $(".chat")[0].scrollTop = $(".chat")[0].scrollHeight;
        }
    },
    methods: {
        send() {
            $.ajax({
                method: "POST",
                url: `/api/message/${this.chat._id}`,
                headers: { "x-auth-token": localStorage.token },
                contentType: "application/json",
                data: JSON.stringify({ text: this.newMessage }),
                success: res => {
                    socket.emit("chat-message", {
                        chat: this.chat,
                        message: res
                    });
                }
            });

            this.newMessage = null;
        },
        disconnect() {
            document.cookie =
                "token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
            window.location.replace("/auth");
        },
        newChat() {
            const chatNameInput = $("#newChatName");
            const chatName = chatNameInput.val();
            chatNameInput.val("");

            // this.loading = true;
            $.ajax({
                method: "POST",
                url: "/api/chat/",
                headers: { "x-auth-token": localStorage.token },
                contentType: "application/json",
                data: JSON.stringify({ name: chatName }),
                success: res => {
                    // this.chat = chatId;
                    // this.messages = res.messages;
                    // this.loading = false;
                }
            });
        },
        switchChat(chatId) {
            this.loadingChat = true;
            $.ajax({
                method: "GET",
                url: `/api/chat/${chatId}`,
                headers: { "x-auth-token": localStorage.token },
                success: res => {
                    const oldChat = this.chat;
                    this.chat = res;
                    this.messages = res.messages.map(data => data.message);
                    this.loadingChat = false;
                    socket.emit("switch-chat", {
                        oldChat: oldChat,
                        newChat: this.chat
                    });
                }
            });
        },
        inviteToChat() {
            const userId = $("#inviteChatUser").val();

            $.ajax({
                method: "POST",
                url: "/api/chat/user/add",
                headers: { "x-auth-token": localStorage.token },
                contentType: "application/json",
                data: JSON.stringify({ chatId: this.chat._id, userId })
            });
        }
    }
});
