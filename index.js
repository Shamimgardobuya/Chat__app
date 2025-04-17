require('dotenv').config()
const express = require('express')
const http = require('http')
const socket = require('socket.io')
const node_env = process.env.NODE_ENV || development
const app = express()
const server = http.createServer(app)
const io = socket(server)
const knex = require('knex')(require('./knexfile').node_env)
const path = require('path')
const csurf = require('csurf')
const cookieParser = require('cookie-parser')
const cors = require('cors');
app.use(cookieParser())

const session = require('express-session')// 
app.use(cors(
    {
        origin: "http://localhost:3001",
        credentials : true
    }
))
app.use(express.json());

const sessionMiddleware = session(
    {
        secret: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } 
    }
)
app.use(sessionMiddleware)
const csrfProtection = csurf({cookie: true});

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});
const userRouter = require('./routes/userRoute')
const development  = require('./knexfile').process.env.NODE_ENV ?? development
app.use('/users', userRouter);
app.get('/current-user', (req, res) => {
    if (req.session.user) {
        return res.json(req.session.user);
    } else {
        return res.status(401).json({ message: 'Not logged in' });
    }
});
app.get('/csrf-token',csrfProtection, (req, res)=> {
    return res.json({
        csrfToken: req.csrfToken() 
    });
})



app.use(express.static(__dirname + '/public'))
io.on('connection', async (socket) => {
    console.log(`a user is connected:, ${socket.id}`)

    if (socket.request.session.user) {
        const { username } = socket.request.session.user;
        console.log(`${username} connected to chat`);



    }
    
    const messageQueue = []
    socket.on('chatMessage', async (username) => {
        try {
            messageQueue.push({
                username: username.username,
                message: username.message
            })
    
        io.emit('chatMessage', {  //displaying users message on client's end 
            username: username.username,
            message: username.message

        })

        if (messageQueue.length >= 10) {
            await knex('messages').insert(
                messageQueue)
                messageQueue.length = 0 //clearing queue after successful insert

        }
        else {
            await knex('messages').insert(
                {
                    username: username.username,
                    message: username.message
                }
            )
        }

        } catch (error) {
            console.log(error.message);
            io.emit("errorMessage", {"Error": `Failed to create message, ${error}`});
            
        }
        
    })

    const messages = await knex('messages').select('username', 'message', 'created_at').orderBy('created_at', 'desc')
                            .limit(10)
    socket.emit('chatHistory', messages) //displaying messages from users

    
    socket.on('disconnect', () => {
        console.log('a user disconnected', socket.id)
    })



})



app.get('/', (req, res) => {
    return res.send('Chat server is running...')

})



app.get('/login-form', (req, res) => {
    return res.sendFile(path.join(__dirname, './public/login_form.html'));

})

server.listen(5000, () => {
    console.log('Server is running on port 5000....')
})








