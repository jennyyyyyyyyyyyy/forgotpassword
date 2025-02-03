const { OAuth2Client } = require('google-auth-library');
const express = require('express');
const app = express();
app.use(express.json());

const CLIENT_ID = '242448462491-cvrlfa9rv9ncnm7cmps7367tsku5p61n.apps.googleusercontent.com'; // Replace with your actual client ID
const client = new OAuth2Client(CLIENT_ID);

app.post('/verify-google-token', async (req, res) => {
    const { idToken } = req.body;
    
    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: CLIENT_ID, // Ensure it matches your app's client ID
        });

        const payload = ticket.getPayload();
        console.log("Verified User:", payload);

        if (payload.email !== 'filconnected.pdm.2024@gmail.com') {
            return res.status(403).json({ error: 'Unauthorized email' });
        }

        res.json({ success: true, user: payload });
    } catch (error) {
        console.error("Token verification error:", error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
