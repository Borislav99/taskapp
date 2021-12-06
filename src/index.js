const express = require("express")
require("./db/mongoose")
const Users = require("./models/user")
const Tasks = require("./models/task")
const { findByIdAndUpdate } = require("./models/user")
const app = express()

const port = process.env.PORT
// --- FILE UPLOADS
app.use(express.json())
// routing
const userRouter = require("../src/routers/user")
const taskRouter = require("../src/routers/task")
app.use(userRouter, taskRouter)
// routing

app.listen(port, ()=>{
    console.log(`server started`);
})
