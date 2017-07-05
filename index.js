'use strict';

// Module imports
var express = require('express')
  , bodyParser = require('body-parser')
  , fs = require('fs')
  , path = require('path')
  , http = require('http')
  , mkdirp = require('mkdirp')
  , log = require('npmlog-ts')
;

log.stream = process.stdout;
log.level = 'verbose';
log.timestamp = true;

// Main handlers registration - BEGIN
// Main error handler
process.on('uncaughtException', function (err) {
  log.info("","Uncaught Exception: " + err);
  log.info("","Uncaught Exception: " + err.stack);
});
// Detect CTRL-C
process.on('SIGINT', function() {
  log.info("","Caught interrupt signal");
  log.info("","Exiting gracefully");
  process.exit(2);
});
// Main handlers registration - END

const IMAGES = 'images'
    , UPLOADFOLDER = path.join(__dirname, IMAGES)
    , PORT = 7333
;

const app    = express()
    , router = express.Router()
    , server = http.createServer(app)
;

const URI = '/'
    , UPLOAD = '/upload/:demozone'
    , DELETE = '/images/:demozone'
;

const SELFIE = 'SELFIE'
    , ID = 'DNI'
;

const SELF = 'http://new.proxy.digitalpracticespain.com:' + PORT + '/' + IMAGES + '/';

function uploadFile(req, res) {
  var demozone = req.params.demozone.toUpperCase();
  var payload = req.body;
  if (!payload || !payload.filename || !payload.data) {
    res.status(400).send("Missing or invalid payload");
    return;
  }
  mkdirp(UPLOADFOLDER + '/' + demozone, (err) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    var binaryData = new Buffer(payload.data, 'base64');
    fs.writeFile(UPLOADFOLDER + '/' + demozone + '/' + payload.filename, binaryData, (err) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.status(200).send({ link: SELF + demozone + '/' + payload.filename });
    });
  });
}

// REST engine initial setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: "50mb"}));
app.use(URI, router);
app.use(URI + IMAGES, express.static(IMAGES));
router.post(UPLOAD, (req, res) => uploadFile(req, res));

server.listen(PORT, function() {
  log.info('', "Web Server running on http://localhost:" + PORT + URI);
});
