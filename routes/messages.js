const express = require('express');

const userAuthentication = require('../util/auth');
const router = express.Router();

const messageController = require('../controllers/messages');

router.post('/send-message', userAuthentication.authenticate, messageController.sendMessage);

router.get('/view-messages', userAuthentication.authenticate, messageController.getMessage);

module.exports = router;
