const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    users: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        }
    ],
    messages: [
        {
            message: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "message"
            }
        }
    ],
    privateChat: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Chat = mongoose.model("chat", ChatSchema);
