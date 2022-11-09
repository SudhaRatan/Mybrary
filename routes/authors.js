const express = require('express')
const Author = require('../models/author')
const router = express.Router()

//All authors route
router
    .route('/')
    .get( async (req,res) => {
        let searchOptions = {}
        if(req.query.name !=null && req.query.name !== ''){
            searchOptions.name = new RegExp(req.query.name, 'i')
        }
        try {
            const authors = await Author.find(searchOptions)
            res.render('authors/index', { 
                authors: authors,
                searchOptions: req.query
             } )
        } catch {
            
        }

        
    })
    .post( async (req,res) => { // Create author route
        const author = new Author({
            name: req.body.name
        })

        try {
            const newAuthor = await author.save()
            // res.redirect(`authors/${newAuthor.id}`)
            res.redirect('authors')
        } catch  {
            res.render('authors/new',{
                author: author,
                errorMessage: "Error Creating author"
            })
        }

        // author.save((err,newAuthor) => {
        //     if (err){
        //         res.render('authors/new',{
        //             author: author,
        //             errorMessage: "Error Creating author"
        //         })
        //     } else {
        //         // res.redirect(`authors/${newAuthor.id}`)
        //         res.redirect('authors')
        //     }
        // })
    })

// New author route
router
    .route('/new')
    .get((req,res) => {
        res.render('authors/new',{ author: new Author() })
    })



module.exports = router