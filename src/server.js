// import express from 'express'
const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
import path from 'path'
// import {MongoClient} from 'mongodb'
const app = express()

app.use(express.static(path.join(__dirname, '/build')))
app.use(bodyParser.json())

const withDB = async (operations,res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', {useUnifiedTopology: true})
        const db = client.db('test-fullstack-react-UI')

        await operations(db);

        client.close()
    } catch (error) {
        res.status(500).json({message: 'Error connecting to db', error})
    }
}

app.get('/api/blog/:name', async (req, res) => {
    withDB(async (db) => {
        const blogName = req.params.name
        const blogInfo = await db.collection('Blogcontent').findOne({name: blogName})
        res.status(200).json(blogInfo)
    }, res)
})

app.post('/api/blog/:name/upvote', async (req, res) => {
    withDB(async (db) => {
        const blogName = req.params.name
        const blogInfo = await db.collection('Blogcontent').findOne({name: blogName})
        await db.collection('Blogcontent').updateOne({name: blogName}, {
            '$set': {
                upvote: blogInfo.upvote + 1,
            }
        })

        const updateBlogInfo = await db.collection('Blogcontent').findOne({name: blogName})
        res.status(200).json(updateBlogInfo)
    }, res)
})

app.post('/api/blog/:name/comment', async (req, res) => {
    withDB( async (db) => {
        const {userName, text} = req.body
        const blogName = req.params.name

        const blogInfo = await db.collection('Blogcontent').findOne({name: blogName})
        await db.collection('Blogcontent').updateOne({name: blogName}, {
            '$set': {
                comment: blogInfo.comment.concat({userName, text})
            }
        })
        const updateBlogInfo = await db.collection('Blogcontent').findOne({name: blogName})
        res.status(200).json(updateBlogInfo)
    }, res)
})

app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'))
})

app.listen(8000, () =>  console.log('Listening on port 8000'))