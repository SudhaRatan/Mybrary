// const multer = require('multer')
const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
// const path = require('path')
// const fs = require('fs')
// const uploadPath = path.join('public',Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg','image/png','images/gif','image/jpg']
// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req,file,callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype))
//     }
// }) 

//All Books route
router
    .route('/')
    .get( async (req,res) => {
        var query = Book.find()
        if (req.query.title != null && req.query.title!=''){
            query=query.regex('title', new RegExp(req.query.title,'i'))
        }
        if (req.query.publishBefore != null && req.query.publishBefore!=''){
            query=query.lte('publishDate', req.query.publishBefore )
        }
        if (req.query.publishAfter != null && req.query.publishAfter!=''){
            query=query.gte('publishDate', req.query.publishAfter )
        }

        try {
            const books = await query.exec()
            res.render('books/index.ejs',{
                books: books,
                searchOptions: req.query
            })
        } catch (error) {
            res.redirect('/')
        }
        
    })
    .post( async (req,res) => { // Create Book route
        // const fileName = req.file != null ? req.file.filename : null
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            publishDate: new Date(req.body.publishDate),
            pageCount: req.body.pageCount,
            // coverImageName: fileName,
            description: req.body.description
        })
        saveCover(book, req.body.cover)
        try {
            const newBook = await book.save()
            // res.redirect(`books/${newBook.id}`)
            res.redirect('books')
        } catch{
            // if (book.coverImageName != null){
            //     removeBookCover(book.coverImageName)
            // }
            renderNewPage(res,book,true)
        }

    })

// function removeBookCover(filename){
//     fs.unlink(path.join(uploadPath,filename),err=>{
//         if(err) console.error(err)
//     })
// }

// New Book route
router
    .route('/new')
    .get( async (req,res) => {
        renderNewPage(res,new Book())
    })

async function renderNewPage(res, book,hasError = false){
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = "Error creating book"
        res.render('books/new',params)
    } catch {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded){
    if ( coverEncoded == null ) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }   
}

module.exports = router