const jwt = require('jsonwebtoken')
const User = require('../db/models/user')

const auth = async (req, res, next) => {
    // console.log('auth middleware')
    // next()
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, process.env.jwtAUTH)
        const user = await User.findOne({ _id: decoded.id, 'tokens.token': token})
        console.log(user,'user')

        if (!user){
            throw new Error('user could not be found ')
        }
        
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({error:'please authenticate'})
    }
}

module.exports = auth 
