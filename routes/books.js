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
            res.redirect(`/books/${newBook.id}`)
            // res.redirect('books')
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


router
    .route('/:id')
    .get( async (req,res) => {
        try {
            const book = await Book.findById(req.params.id)
                             .populate('author')
                             .exec()
            res.render('books/show',{ book: book })
        } catch (error) {
            res.redirect('/')
        }
    })
    .put( async (req,res) => { // Update book page
        let book
        try {
            book = await Book.findById(req.params.id)
            book.title = req.body.title
            book.author = req.body.author
            book.publishDate = req.body.publishDate
            book.pageCount = req.body.pageCount
            book.description = req.body.description
            if (req.body.cover != null && req.body.cover !==''){
                saveCover(book, req.body.cover)
            }
            await book.save()
            res.redirect(`/books/${book.id}`)
            // res.redirect('books')
        } catch (err){
            console.log(err)
            // if (book.coverImageName != null){
            //     removeBookCover(book.coverImageName)
            // }
            if (book != null){
                renderEditPage(res,book,true)
            }else{
                res.redirect('/')
            }
        }
    })
    .delete( async (req, res) => { // Delete Book Page
        let book
        try {
            book = await Book.findById(req.params.id)
            await book.remove()
            res.redirect('/books')
        } catch (error) {
            if (book != null) {
                res.render('books/show', {
                    book:book,
                    errorMessage: "Could not remove book"
                })
            } else {
                res.redirect('/')
            }
        }
    })

router
.route('/:id/edit')
.get( async (req,res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res,book)
    } catch (error) {
        res.redirect('/')
    }
    
})

async function renderNewPage(res, book,hasError = false){
    renderFormPage(res,book,'new',hasError)
}

async function renderEditPage(res, book,hasError = false){
    renderFormPage(res,book,'edit',hasError)
}

async function renderFormPage(res, book,form,hasError = false){
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError){
            if (form === 'edit') params.errorMessage = "Error updating book"
            else params.errorMessage = "Error creating book"
        } 
        res.render(`books/${form}`,params)
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