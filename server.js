const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const app = express();
const port = process.env.PORT || 3000;

// Create an OAuth2 client instance
const CLIENT_ID = '242448462491-qpoa7slhdpr15t6ooikmbu2o4ddh1vts.apps.googleusercontent.com'; // Use your Web Client ID from Google Console
const client = new OAuth2Client(CLIENT_ID);

// Middleware to parse JSON bodies
app.use(express.json());

// API to verify Google ID Token
app.post('/verify-google-token', async (req, res) => {
    const { idToken } = req.body;  // Expecting the idToken from the Android app

    if (!idToken) {
        return res.status(400).json({ message: 'ID token is required' });
    }

    try {
        // Verify the ID token using Google's OAuth2Client
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CLIENT_ID,  // Ensure that the client ID is used to verify the token
        });

        const payload = ticket.getPayload();
        // Payload contains information about the user (e.g., email, name)
        console.log('Verified user: ', payload);

        // Send back the user's information or a success message
        res.status(200).json({
            message: 'Token verified successfully',
            user: {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
            }
        });

    } catch (error) {
        console.error('Error verifying ID token: ', error);
        res.status(401).json({ message: 'Invalid ID token' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
