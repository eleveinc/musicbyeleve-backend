const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.use(cors({ origin: '*' }));

app.get('/download', async (req, res) => {
    try {
        const videoId = req.query.id;
        if (!videoId || !ytdl.validateID(videoId)) {
            return res.status(400).send('Invalid YouTube ID');
        }
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.header('Content-Type', 'video/mp4');

        ytdl(videoUrl, { 
            quality: 'lowestvideo', 
            filter: 'audioandvideo' 
        }).pipe(res);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.listen(3000, () => {
    console.log('MusicByEleve Backend running on port 3000');
});

