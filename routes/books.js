const express = require('express')
const Author = require('../models/author')
const router = express.Router()

//All Books route
router
    .route('/')
    .get( async (req,res) => {
        res.send('All books')
    })
    .post( async (req,res) => { // Create Book route
        res.send('Create Book')
    })

// New Book route
router
    .route('/new')
    .get((req,res) => {
        res.send('New book')
    })



module.exports = router