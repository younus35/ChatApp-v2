const express = require('express');
const router = express.Router();
const groupMessageController = require('../controllers/groupmessages');
const auth = require('../util/auth');

router.post('/send', auth.authenticate, groupMessageController.sendMessage);
router.get('/messages/:groupId', auth.authenticate, groupMessageController.getMessages);

module.exports = router;
