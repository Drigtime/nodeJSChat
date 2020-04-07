const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    chats: [
        {
            chat: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "chat",
            },
        },
    ],
    gravatar: {
        type: String,
    },
    avatar: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = User = mongoose.model("user", UserSchema);
