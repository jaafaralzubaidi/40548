const express = require('express');

const posts = require('./posts');
const auth = require('./auth');
const gets =  require('./gets');
const patches = require('./patches');

const router = express.Router();

router.use('/', auth);

router.use('/posts', posts);

// added new get to route localhost:5000/api/posts
router.use('/posts', gets);
router.use('/posts', patches)

module.exports = router;
