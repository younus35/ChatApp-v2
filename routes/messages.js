const express = require('express');

const userAuthentication = require('../util/auth');
const router = express.Router();

const messageController = require('../controllers/messages');

router.post('/send-message', userAuthentication.authenticate, messageController.sendMessage);

module.exports = router;
