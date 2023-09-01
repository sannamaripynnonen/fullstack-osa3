const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const Person = require('./models/person')

const errorHandler = (error, req, res, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message})
    }
    
    next(error)
}

const unknownEndpont = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(express.static('build'))

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', async (req, res) => {
    console.log('infopage')
    const phonebookSize = await Person.countDocuments()
    const date = new Date()
    res.send(`<p>Phonebook has info for ${phonebookSize} people</p>
            <p>${date}</p>`)
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if (body.name === undefined) {
        return res.status(400).json({
            error: 'name is missing'
        })
    } else if (body.number === undefined) {
        return res.status(400).json({
            error: 'number is missing'
        })
    }

    const person = new Person ({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedPerson => {
            res.json(savedPerson)
        })
        .catch(error => next(error))
})

app.use(unknownEndpont)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})