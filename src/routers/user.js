const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../db/models/user')

const { sendWelcomeEmail, sendCancelationEmail} = require('../emails/accounts')


const sharp = require('sharp')

router.get('/test',(req,res)=>{
    res.send('From a new router')
})


//========
//User Creation
router.post('/users',async (req,res)=>{
    // console.log(req.body)
    // res.send('testing')
    const user = new User(req.body)
    
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }

    //THE BELOW WAS REPLACED BY THE ABOVE ASYNC AWAIT SYNTAX
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     res.status(400).send(e)
    // })
})
//=========

router.post('/users/login',async (req,res) =>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) 
        const token = await user.generateAuthToken()
        res.send({ user, token})
        //res.send(user)
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout',auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({error:'invalid operation'})
    }

    try {
        //const user = await User.findById(req.user._id)

        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })

        await req.user.save()
        
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        //no need since authorised
        // if (!user) {
        //     return res.status(404).send()
        // }

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users', auth,async (req,res)=>{
    
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }

    //THE BELOW WAS REPLACED BY THE ABOVE ASYNC AWAIT SYNTAX
    // User.find({}).then((users)=>{
    //     res.send(users)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})

//
router.get('/users/me', auth,async (req,res)=>{
    res.send(req.user)
    
})
//


//no need for this part since we don't want the users to be able to get another user by calling its id
// router.get('/users/:id',async (req,res)=>{
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)

//         if (!user) {
//                      return res.status(404).send()
//             }
//         res.status(200).send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
    
// })

router.delete('/users/me', auth, async (req,res)=>{
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove() //this replaced the above 4 lines
        sendCancelationEmail(req.user.email, req.user.name)

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/users/me/avatar', auth, async (req,res)=>{
    try {
        req.user.avatar = undefined //this replaced the above 4 lines

        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


const multer = require('multer')
const upload = multer({
    //dest: 'avatars', // remove this line to save to users profile
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req,file,cb){ //cb call back
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('file must be an image'))
        }

        cb(undefined,true)
        // cb(new Error('file must be a jpg'))
        // cb(undefined,true)
        // cb(undefined,false)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    //req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
    
}, (error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router