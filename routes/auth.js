const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const UserSchema = require("../models/UserModel");

const router = express.Router();


router.post("/", async (req, res) => {

  console.log(req.body)
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




  let users = await UserSchema.findOne({ userEmail: req.body.useremail });


  
  if (!users)
    return res.status(400).send({
      status: "Request Failed",
      description: "Bad request",
      data: null,
      error: { message: "Invalid email or password" },
    });

  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    users.userPassword
  );

  if (!isPasswordMatch)
    return res.status(400).send({
      status: "Request Failed",
      description: "Bad request",
      data: null,
      error: { message: "Invalid email or password" },
    });

  const token = jwt.sign(
    { _id: users._id, isAdmin: users.isAdmin },
    process.env.PRIVATE_KEY
  );

  return res.status(200).send({
    status: "request successful",
    description: "login successful",
    data: {
      token: token,
      isAdmin: users.isAdmin,
      username:users.userName,
      phone: users.userPhone,
      email:users.userEmail,
      profile: users.profile
    },
    error: null,
  });

  
});


function validateUser(user) {
  const schema = Joi.object({
    useremail: Joi.string().email(),
    password: Joi.string().min(4).required(),
  });

  return schema.validate(user);
}

module.exports = router;
