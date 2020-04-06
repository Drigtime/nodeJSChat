const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../../middleware/auth");
const bcrypt = require("bcryptjs");
const config = require("config");
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const GridFsStorage = require("multer-gridfs-storage");

const User = require("../../models/User");
const db = config.get("mongoURI");

const storage = new GridFsStorage({
    url: db,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename =
                    buf.toString("hex") + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: "uploads",
                };
                resolve(fileInfo);
            });
        });
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2000000 },
});

/**
 * @route  POST api/upload/avatar
 * @desc   upload avatar
 * @access Public
 */
router.post(
    "/upload/avatar",
    [auth, upload.single("avatar")],
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id);

            const gfs = new mongoose.mongo.GridFSBucket(
                mongoose.connection.db,
                {
                    bucketName: "uploads",
                }
            );

            gfs.find({
                filename: user.avatar,
            }).toArray((err, files) => {
                if (files && files.length > 0) {
                    gfs.delete(new mongoose.Types.ObjectId(files[0]._id));
                }
            });

            await User.findByIdAndUpdate(req.user.id, {
                $set: { avatar: req.file.filename },
            });

            return res.sendStatus(200).end();
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

/**
 * @route  GET api/avatar
 * @desc   Get avatar
 * @access Public
 */
router.get("/avatar/:filename", (req, res) => {
    console.log("res", res);
    console.log("req", req);
    try {
        const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: "uploads",
        });

        gfs.find({
            filename: req.params.filename,
        }).toArray((err, files) => {
            if (!files || files.length === 0) {
                return res.status(404).json({
                    err: "no files exist",
                });
            }
            gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.post(
    "/edit/name",
    [auth, [check("name", "Un pseudo est nécessaire").not().isEmpty()]],
    async (req, res) => {
        try {
            const { name } = req.body;

            await User.findByIdAndUpdate(req.user.id, {
                $set: { name },
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
                min: 6,
            }),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
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
                    $set: { password: newPass },
                });

                return res.sendStatus(200).end();
            }

            res.status(400).json({
                msg: "Le mot de passe courant n'est pas correct",
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);

module.exports = router;
