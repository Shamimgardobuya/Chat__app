
const express = require('express');
const userRouter = express.Router();
const app  = express();
// const csurf = require('csurf')
// const cookieParser = require('cookie-parser')
// const cors = require('cors');
// app.use(cookieParser())



const userController = require('../controllers/userController');


userRouter.all('/login', (req, res)=> {

    return userController.userLogin(req, res);
})

userRouter.post('/create', (req, res)=> {
    return userController.createUser(req, res);
})


module.exports = userRouter;