const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authCookie = require("./middleware/authCookie");

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

// Socket io
io.on("connection", function(socket) {
    socket.broadcast.emit("get-user");

    socket.on("new-connection", user => {
        console.log(`New user join the chat [${user.name}]`);
        socket.broadcast.emit("new-connection", user);
    });

    socket.on("get-user", user => {
        io.emit("new-connection", user);
    });

    socket.on("disconnect", msg => {
        console.log(`Disconnected [${msg.username}] ${msg.message}`);
        io.emit("disconnected", msg);
    });

    socket.on("chat-message", ({ chat, message }) => {
        console.log(`[${message.user.name}] ${message.text}`);
        io.sockets.in(chat._id).emit("chat-message", message);
    });

    socket.on("switch-chat", ({ oldChat, newChat }) => {
        if (oldChat) {
            socket.leave(oldChat._id);
        }
        socket.join(newChat._id);
        // console.log(socket.rooms);
    });
});

const PORT = process.env.PORT || 5000;

http.listen(PORT, () => {
    return console.log(
        `Server started, can be accessed at http://192.168.1.1:${PORT}`
    );
});
