const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../../models/User");

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, cb) {
        cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }
}).single("avatar");

/**
 * @route  POST api/upload/avatar
 * @desc   upload avatar
 * @access Public
 */
router.post("/upload/avatar", auth, (req, res) => {
    try {
        upload(req, res, async err => {
            console.log("req", req.file);
            /*Now do where ever you want to do*/
            const user = await User.findById(req.user.id);

            if (fs.existsSync(`public\\uploads\\${user.avatar}`)) {
                fs.unlinkSync(`public\\uploads\\${user.avatar}`);
            }

            await User.findByIdAndUpdate(req.user.id, {
                $set: { avatar: req.file.filename }
            });

            if (!err) return res.sendStatus(200).end();
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.post(
    "/edit/name",
    [
        auth,
        [
            check("name", "Un pseudo est nécessaire")
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {
        try {
            const { name } = req.body;

            await User.findByIdAndUpdate(req.user.id, {
                $set: { name }
            });

            res.sendStatus(200).end();
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

router.post(
    "/edit/password",
    [
        auth,
        [
            check("password", "Current password must be provided")
                .not()
                .isEmpty(),
            check(
                "newPassword",
                "Please enter a password with 6 or more characters"
            ).isLength({
                min: 6
            })
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
            const { password, newPassword } = req.body;

            const user = await User.findById(req.user.id);
            console.log("user", user);

            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const salt = await bcrypt.genSalt(10);
                const newPass = await bcrypt.hash(newPassword, salt);

                await User.findByIdAndUpdate(req.user.id, {
                    $set: { password: newPass }
                });

                return res.sendStatus(200).end();
            }

            res.status(400).json({
                msg: "Le mot de passe courant n'est pas correct"
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

module.exports = router;
