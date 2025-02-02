require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const users = {}; // Mock user database (Replace with real database)

app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!users[email]) {
        return res.status(400).json({ message: "User not found" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        if (!users[email]) {
            return res.status(400).json({ message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        users[email] = hashedPassword; // Save the new password

        res.json({ message: "Password reset successful!" });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
