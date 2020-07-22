const mongoose = require('mongoose')
const validator = require('validator')
const Task = require('./task')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    } ,
    password: {
        type: String,
        required:true,
        trim: true,
        minlength: 6,
        validate(value) {
            if (value.includes('password')) {
                throw new Error('invalid password')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error("email is invalid")
            }
        }
    },
    age: {
        type: Number,
        validate(value){
            if (value<0) {
                throw new Error('Age must be bigger than 0')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer //no need to require . profile picture is optional
    }
},{
    timestamps: true
    
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//method are available for single instances
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ id: user.id.toString() },process.env.jwtAUTH)
    
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}


//Every time the res.send() is calles in expreess the json.stringify() is applied to what we are sending thus applying JSON once more on the object directly from here and no need to call the method 
userSchema.methods.toJSON = function () {   
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//statics are available for the model
userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email: email})

    if (!user) {
        throw new Error('Unable to find User')
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if (!isMatch) {
        throw new Error ('Unable to login')
    }

    return user
}

//Hash the plain text password before saving
userSchema.pre('save',async function(next){
    const user = this

    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

//delete user tasks when user is removed
userSchema.pre('remove',async function(next){
    const user = this

    await Task.deleteMany({owner: user._id})

    next()
})

const User = mongoose.model('User', userSchema)


// const me = new User({
//     name: 'Panagiotis',
//     password: 'abca22k',
//     email: 'ppolyviou@gmail.com',
//     age: 23
// })

module.exports = User