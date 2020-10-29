const express = require('express')
const router = express.Router()
const Author = require('../models/autor')
const Book = require('../models/livro')

// Todos os Autores
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const authors = await Author.find(searchOptions)
    res.render('autores/index', {
      authors: authors,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// Novo Autor
router.get('/new', (req, res) => {
  res.render('autores/new', { author: new Author() })
})

// Criando Autor
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name
  })
  try {
    const newAuthor = await author.save()
    res.redirect(`autores/${newAuthor.id}`)
  } catch {
    res.render('autores/new', {
      author: author,
      errorMessage: 'Erro ao Criar Autor'
    })
  }
})

// Ver o autor
router.get('/:id', async (req, res) => {
  try{
    const author = await Author.findById(req.params.id)
    const books = await Book.find({ author: author.id }).limit(6).exec()
    res.render('autores/show', {
      author: author,
      booksByAuthor: books
    })
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

// Editar o autor
router.get('/:id/edit', async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    res.render('autores/edit', { author: author })
  } catch {
    res.redirect('/autores')
  }
})

//Atualizar o autor
router.put('/:id', async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    author.name = req.body.name
    await author.save()
    res.redirect(`/autores/${author.id}`)
  } catch  {
    if (author == null) {
      res.redirect('/')
    } else {
      res.render('autores/edit', {
        author: author,
        errorMessage: 'Error ao atualizar Autor'
      })
    }
  }
})

//Deletar o autor
router.delete('/:id', async (req, res) => {
  let author
  try {
    author = await Author.findById(req.params.id)
    await author.remove()
    res.redirect('/autores')
  } catch  {
    if (author == null) {
      res.redirect('/')
    } else {
      res.redirect(`/autores/${author.id}`)
    }
  }
})

module.exports = router