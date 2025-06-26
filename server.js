const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const port = 3020;

const app = express();

// Middleware
app.use(express.static(__dirname)); // Serve static files (CSS, JS, images)
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// MongoDB Atlas Connection
mongoose.connect("mongodb+srv://koushik369mondal:Koushik%40123@cluster0.pqgt4c7.mongodb.net/secretcoder?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("MongoDB Atlas Connected Successfully for Signup"))
.catch((err) => console.error("MongoDB Connection Error:", err));

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
        res.redirect("/login.html"); // Redirect to login.html after successful signup
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

        loggedInUser = user.username;
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
