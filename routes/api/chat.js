const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const Chat = require("../../models/Chat");

/**
 * @route  GET /:chat_id
 * @desc   Get a chat by id
 * @access Private
 */
router.get("/:chat_id", auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chat_id)
            .populate({
                path: "messages.message",
                select: "text user",
                populate: { path: "user", select: "name avatar" }
            })
            .populate({
                path: "users.user",
                select: "name avatar"
            })
            .exec();

        if (chat.users.map(user => user.user.id).includes(req.user.id)) {
            return res.json(chat);
        }

        res.status(405).json({
            msg: "User not allowed to see this chat"
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

/**
 * @route  POST /chat
 * @desc   Create a new chat for the user
 * @access Private
 */
router.post(
    "/",
    [
        auth,
        [
            check("name", "Name is required")
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {
        try {
            const chat = new Chat({
                name: req.body.name,
                owner: req.user.id,
                users: [{ user: req.user.id }]
            });
            const user = await User.findById(req.user.id);

            user.chats.push({ chat: chat._id });

            await chat.save();
            await user.save();

            res.json(chat);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

/**
 * @route  Delete /:chat_id
 * @desc   Delete a chat by id
 * @access Private
 */
router.delete("/:chat_id", auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chat_id);

        if (chat.owner._id == req.user.id) {
            for (const user of chat.users) {
                await User.findByIdAndUpdate(user.user, {
                    $pull: { chats: { chat: req.params.chat_id } }
                });
            }

            await Chat.findByIdAndDelete(req.params.chat_id);

            // await User.findByIdAndUpdate(req.user.id, {
            //     $pull: { chats: { chat: req.params.chat_id } }
            // });

            return res.json({ msg: "Chat have been deleted successfully" });
        }

        res.status(405).json({
            msg: "Action not allowed, user is not the owner of this chat"
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

/**
 * @route  POST /rename
 * @desc   Rename a chat by id
 * @access Private
 */
router.post(
    "/rename",
    [
        auth,
        [
            check("chatId", "The id provided is not valid").isMongoId(),
            check("name", "Name is required")
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

        try {
            const { chatId, name } = req.body;

            const chat = await Chat.findById(chatId);

            if (chat.owner == req.user.id) {
                await chat.updateOne({ $set: { name } });

                return res.json(
                    `Chat ${chat.id} renamed successfully to ${name}`
                );
            }

            res.status(405).json({
                msg: "Action unauthorized, only the owner can rename this chat"
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

/**
 * @route  POST /quit
 * @desc   Quit the chat
 * @access Private
 */
router.post(
    "/quit",
    [auth, [check("chatId", "The id provided is not valid").isMongoId()]],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {
            const { chatId } = req.body;

            // console.log(`User whant to quit chat: ${chatId}`);

            const chat = await Chat.findById(chatId);

            if (chat.owner !== req.user.id) {
                const user = await User.findById(req.user.id);

                await chat.updateOne({ $pull: { users: { user } } });
                await User.findOneAndUpdate(req.user.id, {
                    $pull: { chats: { chat } }
                });

                return res.json(
                    `User quitted the chat ${chat.id} successfully`
                );
            }

            res.status(405).json({
                msg: "Action unauthorized, the owner cannot quit he's own chat"
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

/**
 * @route  POST /user/add
 * @desc   Add a user to a chat
 * @access Private
 */
router.post(
    "/user/add",
    [
        auth,
        [
            check("chatId", "The id provided is not valid").isMongoId(),
            check("users", "The id provided is not valid").isArray()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {
            const { chatId, users } = req.body;

            const chat = await Chat.findById(chatId);
            const addedUsers = [];

            for (const userId of users) {
                const user = await User.findById(userId);

                console.log(chat.owner, req.user.id);

                if (chat.owner == req.user.id) {
                    await chat.updateOne({ $push: { users: { user } } });
                    await user.updateOne({ $push: { chats: { chat } } });

                    addedUsers.push(user.name);
                }
            }

            console.log(
                `${addedUsers.join(", ")} added to the chat ${chat.id}`
            );

            if (addedUsers.length > 0) {
                return res.json(
                    `${addedUsers.join(", ")} added to the chat ${chat.id}`
                );
            }

            res.status(405).json({
                msg: "Action unauthorized, user is not the owner of the chat"
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

/**
 * @route  POST /user/ban
 * @desc   Remove user from chat
 * @access Private
 */
router.post(
    "/user/remove",
    [
        auth,
        [
            check("chatId", "The id provided is not valid").isMongoId(),
            check("userId", "The id provided is not valid").isMongoId()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {
            const { chatId, userId } = req.body;
            console.log("userId", userId);
            console.log("chatId", chatId);

            const chat = await Chat.findById(chatId);

            if (chat.owner == req.user.id) {
                await User.findOneAndUpdate(
                    { _id: userId },
                    {
                        $pull: { chats: { chat: chatId } }
                    }
                );
                await Chat.findOneAndUpdate(
                    { _id: chatId },
                    {
                        $pull: { users: { user: userId } }
                    }
                );

                return res.json(
                    `Removed user from the chat ${chat.id} successfully`
                );
            }

            res.status(405).json({
                msg: "Action unauthorized, user is not the owner of the chat"
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

/**
 * @route  POST /user/ban
 * @desc   Ban user from chat
 * @access Private
 */
// router.post(
//     "/user/ban",
//     [
//         auth,
//         [
//             check("chatId", "The id provided is not valid").isMongoId,
//             check("userId", "The id provided is not valid").isMongoId
//         ]
//     ],
//     async (req, res) => {
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 errors: errors.array()
//             });
//         }

//         try {
//             const { chatId, userId } = req.body;

//             const chat = await Chat.findById(chatId);

//             if (chat.owner === req.user.id) {
//                 await Chat.findOneAndUpdate(
//                     { _id: chatId, "users.user": userId },
//                     { $set: { "users.$.banned": true } }
//                 );
//             }

//             res.status(405).json({
//                 msg: "Action unauthorized, user is not the owner of the chat"
//             });
//         } catch (err) {
//             console.error(err.message);
//             res.status(500).send("Server error");
//         }
//     }
// );

/**
/**
 * @route  POST /user/unban
 * @desc   Unban user from chat
 * @access Private
 */
// router.post(
//     "/user/unban",
//     [
//         auth,
//         [
//             check("chatId", "The id provided is not valid").isMongoId,
//             check("userId", "The id provided is not valid").isMongoId
//         ]
//     ],
//     async (req, res) => {
//         const errors = validationResult(req);

//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 errors: errors.array()
//             });
//         }

//         try {
//             const { chatId, userId } = req.body;

//             const chat = await Chat.findById(chatId);

//             if (chat.owner === req.user.id) {
//                 await Chat.findOneAndUpdate(
//                     { _id: chatId, "users.user": userId },
//                     { $set: { "users.$.banned": false } }
//                 );
//             }

//             res.status(405).json({
//                 msg: "Action unauthorized, user is not the owner of the chat"
//             });
//         } catch (err) {
//             console.error(err.message);
//             res.status(500).send("Server error");
//         }
//     }
// );

module.exports = router;
