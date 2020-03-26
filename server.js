'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const dotenv = require('dotenv').config();
const urlparser = require('./urlparser');

var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// setup schema
const Schema = mongoose.Schema;

var urlSchema = new Schema({
    originalUrl: { type: String, required: true },
    shortUrl: String
});

var ShortUrl = mongoose.model('ShortUrl', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.json({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.use('/api/shorturl/new', (req, res, next) => {
    console.log('Hello Middleware!');
    let url = req.body.url;
    dns.lookup(url, (err, address) => {
        if (err) return res.json({ error: 'invalid URL' });
        console.log(address + ' is valid!');
        next();
    });
});

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function(req, res) {
    res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:key', (req, res) => {
    ShortUrl.findOne({ shortUrl: req.params.key }, (err, data) => {
        if (err) return res.json({ error: 'invalid URL' });
        res.redirect(data.originalUrl);
    });
});

app.post('/api/shorturl/new', (req, res) => {
    let url = req.body.url;
    const shortUrl = new ShortUrl({
        originalUrl: url,
        shortUrl: ''
    });

    shortUrl.save((err, data) => {
        if (err) throw new Error('Invalid URL');
        let shortUrlKey = urlparser.getShortUrlKey(data._id);
        ShortUrl.findByIdAndUpdate(
            data._id,
            { shortUrl: shortUrlKey },
            { useFindAndModify: false },
            (err, data) => {
                if (err) return console.error(err);
                res.json({
                    originalUrl: shortUrl.originalUrl,
                    shortUrl: shortUrlKey
                });
            }
        );
    });
});

app.listen(port, function() {
    console.log('Node.js listening ...');
});
