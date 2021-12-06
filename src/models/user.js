const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Please insert valid email')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value) {
            if(value<0) {
                throw new Error(`Please insert positive value`)
            }
        }
    },
    password:{
        required:true,
        type:String,
        trim:true,
        validate(value) {
            if(value.length<6){
                throw new Error(`Your password must be longer than 6 characters`)
            } else if(value.includes('password')) {
                throw new Error(`Password too weak`)
            }
        }
    },
    tokens: [
        {
            token:{
                type:String,
                required:true                
            }
        }
    ],
    avatar:{
        type:Buffer
    }
}, {
    timestamps:true
})
// virtual
userSchema.virtual('tasks', {
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})
// hash password
userSchema.pre('save', async function (next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next() 
})
// delete tasks
userSchema.pre('remove', async function(next) {
    const Tasks = require("./task")
    await Tasks.deleteMany({owner:this._id})
    next()
})
// find
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await Users.findOne({email})
    if(!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}
// generate token
userSchema.methods.generateAuthToken = async function() {
    const token = await jwt.sign({_id:this._id.toString()}, process.env.JWT_SECRET)
    this.tokens.push({token})
    await this.save()
    return token
}
// return public data
userSchema.methods.toJSON = function() {
    const userObj = this.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar
    return userObj
}
const Users = mongoose.model('Users', userSchema)
module.exports = Users