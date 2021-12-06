// --- SETUP ---
const Users = require("../models/user")
const express = require("express")
const router = new express.Router()
const auth = require("../middleware/auth")
const multer = require("multer")
const sharp = require("sharp")
const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be jpg, jpeg or png'))
        }
        cb(undefined, true)
    }
})
const mailObj = require("../emails/account")
// --- SETUP ---
// --- ROUTING ---
// profil
router.get("/users/me", auth , async (req, res)=>{
    try {
        res.status(201).send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})
// post
router.post('/users', async (req, res)=>{
    try {
        const newUser = Users(req.body)
        const token = await newUser.generateAuthToken()
        await newUser.save() 
        res.status(201).send({
            newUser,
            token
        })
        // slanje mail-a
        await mailObj.sendWelcomeEmail(newUser.email, newUser.name)
    } catch (error) {
        res.status(400).send(error)
    }
})

// update
router.patch('/users/me', auth, async (req, res)=>{
    const allUpdates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isValid = allUpdates.every(item=>{
        return allowedUpdates.includes(item)
    })
    if(!isValid) {
        return res.status(400).send({error:`enter valid fields`})
    }
    try {
        // get user
        // change details
        allUpdates.forEach(item=>{
            req.user[item]=req.body[item]
        })
        // save user
        await req.user.save()
        res.status(201).send(req.user)
    } catch (error) {
        res.status(400).send({error})
    }
})

// delete
router.delete('/users/me',auth, async (req, res)=>{
    try {
        await req.user.remove()
        mailObj.sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

// login
router.post('/users/login', async (req, res)=>{
    try{
        const user = await Users.findByCredentials(req.body.email, req.body.password)
        // func
        const token = await user.generateAuthToken()
        // func
        // public data

        res.send({user, token})
    } catch (error) {
        res.status(400).send()
    }
})
// logout
router.post('/users/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter(item=>{
            return item.token!=req.token
        })
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(401).send(error)
    }
})
// logout-all
router.post('/users/logoutAll', auth, async (req, res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send(req.user)
    } catch (error) {
        res.status(401).send(error)
    }
})
// upload profile image
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send(200)
    // console.log(req.file.buffer)
    res.send()
}, (error, req, res, next)=>{
    res.status(404).send({error:error.message})
})
// delete profile image
router.delete('/users/me/avatar', auth, async (req, res)=>{
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send({response:'avatar deleted'})            
    } catch (error) {
        res.status(500).send({error:'server error'})
    }
})
// get and fetch image
router.get("/users/:id/avatar", async(req,res)=>{
    try {
        const _id = req.params.id
        const user = await Users.findOne({_id})
        if(!user||!user.avatar) {
            throw new Error('cannot find avatar')
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send({error:error.message})
    }
})
// --- ROUTING ---
module.exports = router