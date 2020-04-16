const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    text: {
        type: String
    },
    attach: {
        type: String,
        default: null
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        }
    ],
    deleted: {
        type: Boolean,
        default: false
    },
    deleteDate: {
        type: Date
    },
    edited: {
        type: Boolean,
        default: false
    },
    editDate: {
        type: Date
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Message = mongoose.model("message", MessageSchema);
