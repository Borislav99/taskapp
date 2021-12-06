// --- ROUTER SETUP ---
const Tasks = require("../models/task")
const express = require("express")
const router = new express.Router()
const auth = require("../middleware/auth")
// --- ROUTER SETUP ---
// --- ROUTING ---
// get
router.get('/tasks', auth, async (req, res)=>{
    const match = {}
    if (req.query.completed) {
        match.completed = (req.query.completed=="true")
    }
    // sort
    const sort = {}
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === 'desc' ? -1:1
    }
    // completed
    try {
        // const tasks = await Tasks.find({owner:req.user._id})
        const data = await req.user.populate({path:'tasks', match, options:{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }})
        if(data.tasks.length==0) {
            return res.status(404).send({error:"you dont have any tasks"})
        }
        res.status(200).send(data.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id
    try {
        const task = await Tasks.findOne({_id, owner:req.user._id})
        if(!task) {
            return res.status(400).send({error:`Please enter valid ID`})
        }
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

// post
router.post('/tasks', auth, async (req, res)=>{
    const newTask = new Tasks({...req.body, owner:req.user._id})
    try {
        await newTask.save()
        res.status(201).send(newTask)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async (req, res)=>{
    const taskID = req.params.id
    const myUpdates = Object.keys(req.body)
    const allowedUpdates = ['completed', 'description']
    const valid = myUpdates.every(item=>{
        return allowedUpdates.includes(item)
    })
    if(!valid) {
        return res.status(400).send({error:`please enter valid changes`})
    } 
    try {
        const task = await Tasks.findOne({_id:taskID, owner:req.user._id})
        if(!task) {
            return res.status(404).send({error:`task not found`})
        }
        myUpdates.forEach(item=>{
            task[item] = req.body[item]
        })
        task.save()
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }    
})
// delete
router.delete('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id
    try {
        const deletedTask = await Tasks.findOne({_id, owner:req.user._id})
        if(!deletedTask) {
            return res.status(404).send({error:'cant find that task'})
        }
        await deletedTask.remove()
        res.send(deletedTask)
    } catch (error) {
        res.status(500).send(error)
    }
})
// --- ROUTING ---
module.exports = router