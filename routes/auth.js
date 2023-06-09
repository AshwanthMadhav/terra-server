const bcrypt = require("bcrypt");
const router = require("express").Router();
const { User, validateUser } = require("../models/User");

router.post("/register", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user = new User({
      email: req.body.email,
      password: hashedPassword,
    });

    await user.save();

    res.send("User registered successfully.");
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email or password.");

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isValidPassword)
      return res.status(400).send("Invalid email or password.");

    const token = user.generateAuthToken();
    res.send({ token, id: user._id, message: "User logged in successfully" });
  } catch (e) {
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
