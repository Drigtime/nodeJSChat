const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Chat = require("../../models/Chat");
const Message = require("../../models/Message");

/**
 * @route  GET /:message_id
 * @desc   Get message by id
 * @access Private
 */
router.get("/:message_id", auth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.message_id)
            .populate({ path: "user", select: "name email avatar gravatar" })
            .exec();
        const chat = await Chat.findById(message.chat);

        if (chat.users.map(user => user.user).includes(req.user.id)) {
            res.json(message);
        }

        res.status(405).json({
            msg: "User not allow to get this message"
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

/**
 * @route  POST /:chat_id
 * @desc   Create a new message in the given chat by id
 * @access Private
 */
router.post(
    "/:chat_id",
    [
        auth,
        [
            check("text", "Empty message a not authorized")
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { text } = req.body;

        try {
            const chat = await Chat.findById(req.params.chat_id);

            if (chat.users.map(user => user.user).includes(req.user.id)) {
                let message = new Message({
                    chat,
                    user: req.user.id,
                    text
                });

                await message.save();

                await chat.updateOne({ $push: { messages: { message } } });

                console.log(
                    `New message from user: ${req.user.id} on the chat: ${chat.id} that contain : '${message.text}'`
                );

                message = await message
                    .populate({ path: "user", select: "name email avatar" })
                    .execPopulate();

                return res.json(message);
            }

            res.status(405).json({
                msg: "User not allow to send a message in this chat"
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

/**
 * @route  PUT /:message_id
 * @desc   Edit a message by id
 * @access Private
 */
router.put(
    "/:message_id",
    [
        auth,
        [
            check("text", "Empty message a not authorized")
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { text } = req.body;

        try {
            let message = await Message.findById(req.params.message_id);

            if (message.user == req.user.id) {
                message = await Message.findByIdAndUpdate(
                    message.id,
                    {
                        $set: { text, edited: true }
                    },
                    { new: true }
                );

                return res.json(message);
            }

            res.status(405).json({
                msg: "Permission denied user not allowed to update the message"
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

/**
 * @route  DELETE /:message_id
 * @desc   Delete a message by id
 * @access Private
 */
router.delete("/:message_id", auth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.message_id);

        if (message.user == req.user.id) {
            await Chat.findByIdAndUpdate(message.chat, {
                $pull: { messages: { message: message.id } }
            });
            await Message.findByIdAndRemove(message.id);

            return res.json({ msg: "Message deleted successfully" });
        }

        res.status(405).json({
            msg: "User not allow to delete this message"
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
