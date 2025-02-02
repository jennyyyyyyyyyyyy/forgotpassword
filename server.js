require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Mock user database (replace with real database for production)
const users = {
    "filconnected.thesis2024@gmail.com": bcrypt.hashSync("filconnected", 10), // storing a hashed password for demonstration
};

// Forgot Password Route
app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;

    // Check if user exists
    if (!users[email]) {
        return res.status(400).json({ message: "User not found" });
    }

    // Create a JWT token with a 15-minute expiration time
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Set up the transporter for sending email
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Your Password",
        text: `Click the link to reset your password: ${resetLink}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset email sent!" });
    } catch (error) {
        res.status(500).json({ message: "Error sending email" });
    }
});

// Reset Password Route
app.post("/api/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        // Check if the user exists
        if (!users[email]) {
            return res.status(400).json({ message: "User not found" });
        }

        // Hash the new password and save it
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        users[email] = hashedPassword; // Save the new password

        res.json({ message: "Password reset successful!" });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
