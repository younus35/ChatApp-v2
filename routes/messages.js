const express = require('express');

const userAuthentication = require('../util/auth');
const router = express.Router();

const upload = require('../util/multerConfig')

const messageController = require('../controllers/messages');

router.post('/send-message', upload.single('file'),userAuthentication.authenticate, messageController.sendMessage);

router.get('/view-messages', userAuthentication.authenticate, messageController.getMessage);

module.exports = router;
