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
            },
            banned: {
                type: Boolean,
                default: false
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
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Chat = mongoose.model("chat", ChatSchema);
