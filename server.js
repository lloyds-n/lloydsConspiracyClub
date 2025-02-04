const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = 8000;
const crypto = require('crypto');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));






app.use(express.static('client'));



const uploaded = path.join(__dirname, 'client/images');
if (!fs.existsSync(uploaded)) {
    fs.mkdirSync(uploaded, { recursive: true });
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploaded);
    },
    filename: function (req, file, cb) {
        const hash = crypto.randomBytes(16).toString('hex');
        cb(null, `${hash}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });
app.use('/images', express.static(uploaded));






const sightingsFile = path.join(__dirname, 'sightings.json');

function getSightings() {
    try {
        const data = fs.readFileSync(sightingsFile
        , 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}



app.get('/api/sightings', (req, res) => {
    const sightings = getSightings();
    
    if (!sightings || sightings.length === 0) {
        return res.status(404).json({ error: 'No sightings found' });
    }

    res.status(200).json(sightings);
});




app.get('/api/sightings/:id', (req, res) => {
    const sightings = getSightings();
    const sighting = sightings.find(s => s.id == req.params.id);

    if (!sighting) {
        return res.status(404).json({ error: 'Sighting not found' });
    }

    res.status(200).json(sighting);
});
//gets one image and all comments related to that image (gets one comment first then upon suer request gets all comments)




app.post('/api/add-sighting', upload.single('image'), (req, res) => {
    const { title, location, date, comments } = req.body;

   
    if (!title || !location || !date || !req.file) {
        return res.status(400).json({ error: 'Please fill out all fields.' });
    }
    
    const sightings = getSightings();
    const newSighting = {
        id: sightings.length > 0 ? sightings[sightings.length - 1].id + 1 : 1,
        title,
        location,
        date,
        image: `images/${req.file.filename}`, 
        comments: comments ? [comments] : []
    };

    sightings.push(newSighting);

    fs.writeFile(sightingsFile
    , JSON.stringify(sightings, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Couldnt save sighting' });
        }
        res.status(200).json({ message: 'Sighting added!', sighting: newSighting });
    });
});



app.post('/api/sightings/:id/comments', (req, res) => {
    const sightings = getSightings();
    const sightingIndex = sightings.findIndex(s => s.id == req.params.id);

    if (sightingIndex === -1) {
        return res.status(404).json({ error: 'Sighting not found' });
    }

    const newComment = req.body.comment;
    if (!newComment) {
        return res.status(400).json({ error: 'Please enter a comment' });
    }

    sightings[sightingIndex].comments.push(newComment);

    fs.writeFile(sightingsFile, JSON.stringify(sightings, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Couldn\'t save comment' });
        }
        res.status(200).json({
            message: 'Comment added!',
            comments: sightings[sightingIndex].comments
        });
    });
});

// module.exports = app;
app.listen(8000, () => {
    console.log(`Server is running on port ${PORT}`);
}); 

