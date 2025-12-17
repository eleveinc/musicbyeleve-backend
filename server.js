const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.use(cors({ origin: '*' }));

// 1. Home Route (So you know it's alive)
app.get('/', (req, res) => {
    res.send('Eleve Backend is Online & Running! Use /download to get files.');
});

// 2. Download Route
app.get('/download', async (req, res) => {
    try {
        const videoId = req.query.id;
        const type = req.query.type || 'video';

        if (!videoId || !ytdl.validateID(videoId)) {
            return res.status(400).send('Error: Invalid YouTube ID');
        }

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Get Info
        const info = await ytdl.getInfo(videoUrl);
        const cleanTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        // Choose Format
        let formatSettings = {};
        let fileExt = 'mp4';
        let contentType = 'video/mp4';

        if (type === 'audio') {
            formatSettings = { quality: 'highestaudio', filter: 'audioonly' };
            fileExt = 'mp3';
            contentType = 'audio/mpeg';
        } else {
            formatSettings = { quality: 'lowestvideo', filter: 'audioandvideo' };
            fileExt = 'mp4';
            contentType = 'video/mp4';
        }

        // Set Headers
        res.header('Content-Disposition', `attachment; filename="${cleanTitle}.${fileExt}"`);
        res.header('Content-Type', contentType);

        // Pipe Stream
        ytdl(videoUrl, formatSettings).pipe(res);

    } catch (error) {
        console.error('Real Error:', error);
        // SHOW THE REAL ERROR ON SCREEN
        res.status(500).send(`Server Error Details: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

