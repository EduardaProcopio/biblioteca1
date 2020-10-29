const express = require('express')
const router = express.Router()
const Book = require('../models/livro')
const Author = require('../models/autor')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// Todos os livros
router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render('livros/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// Novo Livro
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
})

// Criando Livro
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    res.redirect(`livros/${newBook.id}`)
  } catch {
    renderNewPage(res, book, true)
  }
})

// Ver livro
router.get('/:id', async (req, res) => {
  try{
    const book = await Book.findById(req.params.id).populate('author').exec()
    res.render('livros/show', { book: book })
  } catch {
    res.redirect('/')
  }
})

//Editar livro
router.get('/:id/edit', async (req,res) => {
  try{
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  }catch{
    res.redirect('/')
  }
})

// Atualizar Livro
router.put('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date (req.body.publishDate).toLocaleDateString('pt-br')
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(book,req.cover)
    }
    await book.save()
    res.redirect(`/livros/${book.id}`)
  } catch {
    if (book != null) {
      renderNewPage(res, book, true)
    } else {
      res.redirect('/')
    }
  }
})

//Deletar livro
router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/livros')
  } catch {
    if (book != null) {
      res.render('livros/show', {
        book: book,
        errorMessage: 'Não foi possivel excluir o livro'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}
async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if  (hasError){
      if (form === 'edit') {
        params.errorMessage = 'Erro ao editar Livro'
      } else {
        params.errorMessage = 'Erro ao criar Livro'
      }
    }
    res.render(`livros/${form}`, params)
  } catch {
    res.redirect('/livros')
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router