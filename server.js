const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));

// Root route
app.get('/', (req, res) => res.send('Eleve Backend (Proxy v10) is Online'));

// New Download Logic (Cobalt v10 Compatible)
app.get('/download', async (req, res) => {
    const videoId = req.query.id;
    const type = req.query.type || 'video'; // 'audio' or 'video'
    
    if (!videoId) return res.status(400).send('Missing Video ID');

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    console.log(`Processing: ${videoId} [${type}]`);

    try {
        // We use a working public instance.
        // If this one ever fails, replace 'https://api.cobalt.tools' with another v10 instance.
        const apiUrl = 'https://api.cobalt.tools/api/json';

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: videoUrl,
                // v10 Options
                filenamePattern: "basic",
                isAudioOnly: type === 'audio',
                disableMetadata: true 
            })
        });

        const data = await response.json();

        // Check for v10 success response
        if (data.status === 'stream' || data.status === 'redirect') {
            return res.redirect(data.url);
        } else if (data.status === 'picker') {
            // Sometimes it returns multiple items, pick the first one
            return res.redirect(data.picker[0].url);
        } else {
            throw new Error(data.text || 'Engine could not generate link');
        }

    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).send(`Download Error: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

