const express = require('express');
const router = express.Router();
const runningtrails = require('../controllers/runningtrails');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateRunningtrail } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Runningtrail = require('../models/runningtrail');

router.route('/')
    .get(catchAsync(runningtrails.index))
    .post(isLoggedIn, upload.array('image'), validateRunningtrail, catchAsync(runningtrails.createRunningtrail))


router.get('/new', isLoggedIn, runningtrails.renderNewForm)

router.route('/:id')
    .get(catchAsync(runningtrails.showRunningtrail))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateRunningtrail, catchAsync(runningtrails.updateRunningtrail))
    .delete(isLoggedIn, isAuthor, catchAsync(runningtrails.deleteRunningtrail));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(runningtrails.renderEditForm))



module.exports = router;