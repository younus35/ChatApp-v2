const express = require('express');

const router = express.Router();

const userController = require('../controllers/users');

router.post('/signup', userController.signUp)

router.post('/signin', userController.signIn)

router.get('/all-users', userController.allUsers)

module.exports = router;