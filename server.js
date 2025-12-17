const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));

// Root route
app.get('/', (req, res) => res.send('Eleve Backend (Proxy Engine) is Online'));

// New Download Logic
app.get('/download', async (req, res) => {
    const videoId = req.query.id;
    const type = req.query.type || 'video'; // 'audio' or 'video'
    
    if (!videoId) return res.status(400).send('Missing Video ID');

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    console.log(`Processing: ${videoId} [${type}]`);

    try {
        // We ask Cobalt API to handle the YouTube connection for us
        // This bypasses the Render IP ban completely.
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: videoUrl,
                isAudioOnly: type === 'audio', // If true, gives MP3
                aFormat: 'mp3' // Ensure audio is MP3 format
            })
        });

        const data = await response.json();

        if (data.url) {
            // Success! We redirect the user to the file directly.
            // This starts the download immediately in their browser.
            return res.redirect(data.url);
        } else {
            // If the engine failed (rare), show the reason
            throw new Error(data.text || 'Engine could not generate link');
        }

    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).send(`Download Error: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

