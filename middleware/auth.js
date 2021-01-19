const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).send({
      status: "request failed",
      description: "Access Denied No Auth Token so you are not authorised to perorm that operation",
    });

  try {
    const payload = jwt.verify(token, process.env.PRIVATE_KEY);
    req.user = payload;
    next();
  } catch (err) {
    res
      .status(400)
      .send({ status: "request failed", description: "Invalid auth token" });
  }
};
