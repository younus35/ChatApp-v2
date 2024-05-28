const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groups');
const auth = require('../util/auth');

router.post('/create', auth.authenticate, groupController.createGroup);
router.post('/invite', auth.authenticate, groupController.inviteToGroup);
router.get('/my-groups', auth.authenticate, groupController.getGroups);
router.get('/:groupId/members', auth.authenticate, groupController.getGroupMembers);
router.delete('/remove-user/:userId', auth.authenticate, groupController.removeMember);

module.exports = router;
