const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authCookie = require("./middleware/authCookie");

const User = require("./models/User");

// Connect Database
connectDB();

// Init Middleware
app.use(cookieParser());
app.use(express.json({ extended: false }));
app.use(express.static(__dirname + "/public"));

// Api Routes
app.get("/api/", (req, res) => res.send("API Running"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/chat", require("./routes/api/chat"));
app.use("/api/message", require("./routes/api/message"));

// Routes
app.get("/", (req, res) => {
    res.redirect("/chat");
});
// authCookie first parameter is to say that you need to be authenticated or not and the second parameter the fallback route
app.get("/auth", authCookie(false, "/chat"), (req, res) => {
    res.sendFile(__dirname + "/public/Authentification.html");
});
app.get("/register", authCookie(false, "/chat"), (req, res) => {
    res.sendFile(__dirname + "/public/register.html");
});
app.get("/chat", authCookie(true, "/auth"), (req, res) => {
    res.sendFile(__dirname + "/public/chat/chat.html");
});

const currentConnections = [];

// Socket io
io.on("connection", function(socket) {
    // socket.broadcast.emit("get-user");

    socket.on("new-connection", user => {
        if (user !== null) {
            // console.log(`New user join the chat [${user.name}]@[${user._id}]`);

            console.log("currentConnections", currentConnections);
            if (Object.keys(currentConnections).length > 0) {
                const key = Object.keys(currentConnections).find(
                    key => currentConnections[key]._id == user._id
                );
                console.log("key", key);

                if (key === undefined)
                    currentConnections[socket.client.id] = user;
            } else {
                currentConnections[socket.client.id] = user;
            }

            // console.log(currentConnections);

            // socket.broadcast.emit("new-connection", user);
        }
    });

    // socket.on("get-user", user => {
    //     io.emit("new-connection", user);
    // });

    socket.on("disconnect", msg => {
        // console.log(`Disconnected [${msg.username}] ${msg.message}`);
        socket.leaveAll();
        delete currentConnections[socket.client.id];
        
        io.emit("disconnected", msg);
    });

    socket.on("chat-message", ({ chat, message }) => {
        // console.log(`[${message.user.name}] ${message.text}`);
        io.sockets.in(chat._id).emit("chat-message", message);
    });

    socket.on("add-user-to-chat", ({ users, chat }) => {
        for (const user of users) {
            console.log("users", users);
            console.log("currentConnections", currentConnections);
            const key = Object.keys(currentConnections).find(
                key => currentConnections[key]._id == user
            );

            console.log("key", key);
            if (key) io.to(key).emit("added-to-a-chat");
        }

        io.in(chat._id).clients((error, clients) => {
            io.in(chat._id).emit(
                "added-user-to-chat",
                clients.map(client => currentConnections[client])
            );
        });
    });

    socket.on("quit-chat", async ({ chatId }) => {
        // let users = await User.find({ "chats.chat": chatId });
        // users = users.filter(user => user.id !== currentConnections[socket.client.id]._id).map(user => user.id);

        // for (const user of users) {
        //     const key = Object.keys(currentConnections).find(
        //         key => currentConnections[key]._id == user
        //     );

        //     if (key) io.to(key).emit("user-quitted-chat");
        // }

        io.in(chatId).emit("user-quitted-chat");

        socket.emit("quitted-chat");
    });

    socket.on("delete-chat", async ({ chatId }) => {
        let users = await User.find({ "chats.chat": chatId });
        users = users.map(user => user.id);

        for (const user of users) {
            const key = Object.keys(currentConnections).find(
                key => currentConnections[key]._id == user
            );

            if (key) io.to(key).emit("chat-deleted");
        }
    });

    socket.on("switch-chat", ({ oldChat, newChat }) => {
        if (oldChat) {
            socket.leave(oldChat._id);
            io.in(oldChat._id).clients((error, clients) => {
                // console.log(clients);

                io.in(oldChat._id).emit(
                    "new-connection",
                    clients.map(client => currentConnections[client])
                );
            });
        }
        socket.join(newChat._id);
        io.in(newChat._id).clients((error, clients) => {
            // console.log(clients);

            io.in(newChat._id).emit(
                "new-connection",
                clients.map(client => currentConnections[client])
            );
        });

        // console.log(socket.rooms);
    });
});

const PORT = process.env.PORT || 5000;

http.listen(PORT, () => {
    return console.log(
        `Server started, can be accessed at http://localhost:${PORT}`
    );
});
