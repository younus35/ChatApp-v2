const express = require('express');
const router = express.Router();
const groupMessageController = require('../controllers/groupmessages');
const auth = require('../util/auth');
const upload = require('../util/multerConfig')

router.post('/send', upload.single('file'),auth.authenticate, groupMessageController.sendMessage);
router.get('/messages/:groupId', auth.authenticate, groupMessageController.getMessages);

module.exports = router;
