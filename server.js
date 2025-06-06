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

// Simple session store (not for production)
let loggedInUser = null;

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
        res.send("Signup Successful! <a href='/login.html'>Login here</a>");
    } catch (err) {
        console.error("Error saving user:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Handle login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await SignupUser.findOne({ email });

        if (!user) {
            return res.send("No user found with this email. <a href='/signup.html'>Signup here</a>");
        }

        if (user.password !== password) {
            return res.send("Incorrect password. <a href='/login.html'>Try again</a>");
        }

        loggedInUser = user.username; // Store logged-in user's name
        res.redirect("/");
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Root route - show logged-in user
app.get("/", (req, res) => {
    if (loggedInUser) {
        res.send(`<h2>Welcome, ${loggedInUser}!</h2><p>You are logged in.</p>`);
    } else {
        res.sendFile(path.join(__dirname, "index.html"));
    }
});

// Start Server
app.listen(port, () => {
    console.log("Server running at http://localhost:" + port);
});