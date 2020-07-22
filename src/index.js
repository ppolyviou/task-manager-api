const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/tasks')


const app = express()
const port = process.env.PORT// || 3000


const multer = require('multer')
const upload = multer({
    dest: 'images'
})

app.post('/upload', upload.single('upload'), (req,res) => {
    res.send()
})

// app.use((req,res, next)=> {
//     if (req.method === 'GET') {
//         res.send('GET requets are disabled')
//     } else {
//         next()
//     }
// })

// app.use((req,res,next)=>{
//     res.status(503).send('Site is currently down.Check back soon')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

//
// Without express middleware new request => run route handler
//
// With middleware: new request => do something => run route handler
//

app.listen(port,()=>{
    console.log('server is up on port ' + port)
})

//const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//     const token = jwt.sign({_id:'abs123'},'thisismynewcourse',{expiresIn:'10 seconds'})
//     console.log(token)

//     const data = jwt.verify(token,'thisismynewcourse')
//     console.log(data)
// }
//note about the 2nd part of the token. You can decode the second part of the token at https://www.base64decode.org/ and get a json with the id and a timestamp

//myFunction()

const Task = require('./db/models/task')
const User = require('./db/models/user')


const main = async () => {
    // const task = await Task.findById('5f106e569fdf867eae6d1e30')
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)

    // const user = await User.findById(task.owner)
    // console.log(user.name)

    const user = await User.findById('5f106d43d5050f7e5ce621d0')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}

//main()