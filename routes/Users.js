const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const UserSchema = require("../models/UserModel");
const middleWare = require("../middleware/auth");

const router = express.Router();

router.get("/me", middleWare, async (req, res) => {
  try {
    const currentUser = await UserSchema.findById(req.user._id).select(
      "-userPassword"
    );
    res.status(200).send({
      status: "Request Successful",
      description: "Current user fetch successful",
      data: currentUser,
      error: null,
    });
  } catch (err) {
    return res.status(500).send({
      status: "Request Failed",
      description: "Internal Server Error",
      data: null,
      error: {
        message: "Something went wrong",
        error: err,
      },
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await UserSchema.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(404).send(error);
  }
});

router.post("/", async (req, res) => {
  const result = validateUser(req.body);

  if (result.error)
    return res.status(400).send({
      status: "failed",
      description: "Bad Request",
      data: null,
      error: {
        message: result.error.details[0].message,
      },
    });

  let user = await UserSchema.findOne({ userEmail: req.body.useremail });

  if (user)
    return res.status(400).send({
      status: "Request Failed",
      description: "Bad Request",
      data: null,
      error: { message: "User With that email already exists" },
    });

  const salt = await bcrypt.genSalt(10);
  const hasedPassword = await bcrypt.hash(req.body.password, salt);

  const postUser = new UserSchema({
    isAdmin: false,
    userName: req.body.username,
    userEmail: req.body.useremail,
    userPhone: req.body.phone,
    userPassword: hasedPassword,
  });

  try {
    const userData = await postUser.save();

    const token = jwt.sign(
      { _id: userData._id, isAdmin: userData.isAdmin },
      process.env.PRIVATE_KEY
    );

    res.header("x-auth-token", token).status(200).send({
      status: "Request Succesful",
      description: "User created",
      data: userData,
    });
  } catch (error) {
    res.status(500).send({
      status: "Request Failed",
      description: "Could not create user",
      error: {
        code: error.code,
        error: error,
      },
    });
  }
});

router.put("/", middleWare, async (req, res) => {
  try {
    console.log(req.user._id);
    const postUpdate = await UserSchema.updateOne(
      { _id: req.user._id },
      {
        $set: {
          userName: req.body.username,
          userEmail: req.body.useremail,
          userPhone: req.body.phone,
        },
      }
    );

    res.status(200).send({
      status: "Request Successful",
      description: "User updated",
      data: postUpdate,
      error: null,
    });
  } catch (error) {
    res.status(200).send({
      status: "Request Failed",
      description: "User updated was not successful",
      data: null,
      error: error,
    });
  }
});

router.delete("/", middleWare, async (req, res) => {
  if (!req.user.isAdmin)
    return res
      .status(403)
      .send({
        status: "Request Failed",
        description: "Forbidden",
        error: { message: "You are not allowed to execute this request" },
      });

  try {
    const deleted = await UserSchema.deleteOne({ _id: req.body.userId });
    res.status(200).send({
      status: "Request Successful",
      description: "User was successfully deleted",
      data: deleted,
      error: null,
    });
  } catch (error) {
    res.status(200).send({
      status: "Request Failed",
      description: "User was not successfully deleted",
      data: null,
      error: error,
    });
  }
});

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().required(),
    useremail: Joi.string().email(),
    phone: Joi.string().required(),
    password: Joi.string().min(4).required(),
  });

  return schema.validate(user);
}

module.exports = router;
