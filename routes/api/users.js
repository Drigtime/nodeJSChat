const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const Chat = require("../../models/Chat");

router.get("/all", async (req, res) => {
    try {
        const users = await User.find({});       

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

/**
 * @route  POST api/users
 * @desc   Register user
 * @access Public
 */
router.post(
    "/",
    [
        check("name", "Name is required")
            .not()
            .isEmpty(),
        check("email", "Please include a valid email").isEmail(),
        check(
            "password",
            "Please enter a password with 6 or more characters"
        ).isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        try {
            // See if user exists
            let user = await User.findOne({
                email
            });
            // Get the default chat
            if (user) {
                return res.status(400).json({
                    errors: [
                        {
                            msg: "User already exist"
                        }
                    ]
                });
            }
            // Get users gravatar
            const avatar = gravatar.url(email, {
                s: "200",
                rating: "pg",
                d: "mm"
            });

            user = new User({
                name,
                email,
                avatar,
                password,
                chats: [{ chat: config.get("defaultChat") }]
            });

            // Encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();
            await Chat.findByIdAndUpdate(config.get("defaultChat"), {
                $push: { users: { user } }
            });

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                config.get("jwtSecret"),
                {
                    expiresIn: 360000
                },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token
                    });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

/**
 * @route  POST /delete
 * @desc   Deleted the account of logged user
 * @access Private
 */
router.delete("/delete", auth, async (req, res) => {
    try {
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: "User deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// /**
//  * @route  POST /ban/:user_id
//  * @desc   Ban user with the given id
//  * @access Private
//  */
// router.post("/:user_id/ban", auth, async (req, res) => {
//     try {
//         let user = await User.findById(req.params.user_id);

//         if (user) {
//             user = await User.findByIdAndUpdate(
//                 req.params.user_id,
//                 {
//                     $set: { banned: true }
//                 },
//                 { new: true }
//             ).select("-password");

//             return res.json(user);
//         }

//         res.json({ msg: "User doesn't exist" });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send("Server error");
//     }
// });

// /**
//  * @route  POST /unban/:user_id
//  * @desc   Unban user with the given id
//  * @access Private
//  */
// router.post("/:user_id/unban", auth, async (req, res) => {
//     try {
//         let user = await User.findById(req.params.user_id);

//         if (user) {
//             user = await User.findByIdAndUpdate(
//                 req.params.user_id,
//                 {
//                     $set: { banned: false }
//                 },
//                 { new: true }
//             ).select("-password");

//             return res.json(user);
//         }

//         res.json({ msg: "User doesn't exist" });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send("Server error");
//     }
// });

module.exports = router;
