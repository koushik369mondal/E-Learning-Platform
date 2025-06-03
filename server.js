const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const port = 3020;

const app = express();

// Middleware
app.use(express.static(__dirname)); // Serve static files (CSS, JS, images)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/secretcoder");
const db = mongoose.connection;

db.once("open", () => {
    console.log("MongoDB Connected Successfully for Signup");
});

// Mongoose Schema & Model
const signupSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const SignupUser = mongoose.model("signupusers", signupSchema);

// Routes
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "signup.html"));
});

app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const newUser = new SignupUser({ username, email, password });
        await newUser.save();
        console.log("New Signup:", newUser);
        res.send("Signup Successful!");
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Start Server
app.listen(port, () => {
    console.log("Server running at http://localhost:" + port);
});
