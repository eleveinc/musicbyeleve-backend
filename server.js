













kconst express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.use(cors({ origin: '*' }));

// Root route to check if server is alive
app.get('/', (req, res) => {
    res.send('Eleve Backend is Online (Anti-Bot Mode Active)');
});

app.get('/download', async (req, res) => {
    try {
        const videoId = req.query.id;
        const type = req.query.type || 'video';

        if (!videoId || !ytdl.validateID(videoId)) {
            return res.status(400).send('Invalid YouTube ID');
        }

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // --- THE FIX: FORCE ANDROID CLIENT ---
        // We tell YouTube we are an Android app to bypass the 429 block
        const requestOptions = {
            playerClients: ["ANDROID", "IOS"] 
        };

        // 1. Get Info with Anti-Bot Options
        const info = await ytdl.getInfo(videoUrl, requestOptions);
        
        const cleanTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '');

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

        // Add the request options to the download call too
        const downloadOptions = {
            ...formatSettings,
            ...requestOptions
        };

        res.header('Content-Disposition', `attachment; filename="${cleanTitle}.${fileExt}"`);
        res.header('Content-Type', contentType);

        ytdl(videoUrl, downloadOptions).pipe(res);

    } catch (error) {
        console.error('Server Error:', error.message);
        // If it's still a 429, we tell the user clearly
        if (error.statusCode === 429) {
            res.status(429).send('Error 429: YouTube is blocking this server IP. Try again in 5 minutes.');
        } else {
            res.status(500).send(`Server Error: ${error.message}`);
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

