const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/db");
const authCookie = require("./middleware/authCookie");

const User = require("./models/User");

// Connect Database
connectDB();

// Init Middleware
app.use(cookieParser());
app.use(express.json({ extended: false }));

// Api Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/chat", require("./routes/api/chat"));
app.use("/api/message", require("./routes/api/message"));

const currentConnections = [];

// Socket io
io.on("connection", function(socket) {
    socket.on("new-connection", user => {
        if (user !== null) {
            // console.log(`New user join the chat [${user.name}]@[${user._id}]`);

            console.log("currentConnections", currentConnections);

            if (currentConnections[user._id] === undefined)
                currentConnections[user._id] = {
                    ...user,
                    socketId: socket.client.id
                };

            io.emit(
                "new-connection",
                Object.keys(currentConnections).map(
                    key => currentConnections[key]
                )
            );
        }
    });

    socket.on("disconnect", msg => {
        const clientId = Object.keys(currentConnections).find(
            key => currentConnections[key].socketId == socket.client.id
        );

        console.log("currentConnections", currentConnections);
        delete currentConnections[clientId];
        console.log("currentConnections", currentConnections);
        socket.leaveAll();

        io.emit("disconnected", msg);
    });

    socket.on("chat-message", ({ chat, message }) => {
        io.sockets.in(chat._id).emit("chat-message", message);
    });

    socket.on("edited-message", ({ chat, message }) => {
        console.log("edit chat", chat);
        io.sockets.in(chat._id).emit("edited-message", message);
    });

    socket.on("deleted-message", ({ chat, message }) => {
        console.log("delete chat", chat);
        io.sockets.in(chat._id).emit("deleted-message", message);
    });

    socket.on("add-user-to-chat", ({ users, chat }) => {
        for (const user of users) {
            console.log("user", user);
            io.to(currentConnections[user].socketId).emit("update-user-data");
        }

        io.in(chat._id).clients((error, clients) => {
            io.in(chat._id).emit(
                "added-user-to-chat",
                clients.map(client => currentConnections[client])
            );
        });
    });

    socket.on("remove-user-from-chat", ({ chatId, userId }) => {
        console.log("REMOVE USER FROM CHAT");

        io.to(currentConnections[userId].socketId).emit("removed-from-a-chat");

        io.in(chatId).clients((error, clients) => {
            io.in(chatId).emit(
                "user-quitted-chat",
                clients.map(client => currentConnections[client])
            );
        });
    });

    socket.on("quit-chat", ({ chatId }) => {
        io.in(chatId).emit("user-quitted-chat");

        socket.emit("quitted-chat");
    });

    socket.on("delete-chat", async ({ chatId }) => {
        let users = await User.find({ "chats.chat": chatId });
        users = users.map(user => user.id);

        for (const user of users) {
            console.log("user", user);
            io.to(currentConnections[user].socketId).emit("update-user-data");
        }
    });

    socket.on("rename-chat", async ({ chatId }) => {
        let users = await User.find({ "chats.chat": chatId });
        users = users.map(user => user.id);

        for (const user of users) {
            console.log("user", user);
            io.to(currentConnections[user].socketId).emit("update-user-data");
        }
    });

    socket.on("switch-chat", ({ oldChat, newChat }) => {
        if (oldChat) {
            socket.leave(oldChat._id);
        }
        socket.join(newChat._id);
    });
});

// Serve static assets in pridction
if (process.env.NODE_ENV === "production") {
    // Set static folder
    app.use(express.static("client/dist"));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
    });
}

const PORT = process.env.PORT || 5000;

http.listen(PORT, () => {
    return console.log(
        `Server started, can be accessed at http://localhost:${PORT}`
    );
});
