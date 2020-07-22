const mongoose = require('mongoose')

mongoose.connect(process.env.mongoDB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})





