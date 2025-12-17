const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const app = express();

app.use(cors({ origin: '*' }));

// --- LOAD COOKIES (The Anti-Ban Passport) ---
let agentOptions = {};
try {
    const cookies = JSON.parse(fs.readFileSync('cookies.json'));
    agentOptions = { agent: ytdl.createAgent(cookies) };
    console.log("✅ Cookies loaded! YouTube will trust this server.");
} catch (error) {
    console.error("⚠️ No cookies found. You might get Error 429.");
}

app.get('/', (req, res) => res.send('Eleve Backend is Live (Authenticated)'));

app.get('/download', async (req, res) => {
    try {
        const videoId = req.query.id;
        const type = req.query.type || 'video';

        if (!videoId || !ytdl.validateID(videoId)) return res.status(400).send('Invalid ID');

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Use the cookies (agentOptions) to get info
        const info = await ytdl.getInfo(videoUrl, agentOptions);
        const cleanTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        let formatSettings = type === 'audio' 
            ? { quality: 'highestaudio', filter: 'audioonly' } 
            : { quality: 'lowestvideo', filter: 'audioandvideo' };

        let contentType = type === 'audio' ? 'audio/mpeg' : 'video/mp4';
        let fileExt = type === 'audio' ? 'mp3' : 'mp4';

        res.header('Content-Disposition', `attachment; filename="${cleanTitle}.${fileExt}"`);
        res.header('Content-Type', contentType);

        // Download using the cookies
        ytdl(videoUrl, { ...formatSettings, ...agentOptions }).pipe(res);

    } catch (error) {
        console.error('Error:', error.message);
        // If 429 happens even with cookies, tell the user
        if(error.statusCode === 429) {
             res.status(429).send('Server is cooling down. Please try again in a few minutes.');
        } else {
             res.status(500).send(`Server Error: ${error.message}`);
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

