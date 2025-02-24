const express = require('express')
const http = require('http')
const socket = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socket(server)
const knex = require('knex')(require('./knexfile').development)
const path = require('path')


const session = require('express-session')// 
app.use(express.json());
const sessionMiddleware = session(
    {
        secret: 'NstYCdpdE4URb8OUAAAB', // Change this to a strong secret
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set to true if using HTTPS
    }
)
app.use(sessionMiddleware)
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});
const userRouter = require('./routes/userRoute')
app.use('/users', userRouter);
app.get('/current-user', (req, res) => {
    if (req.session.user) {
        return res.json(req.session.user);
    } else {
        return res.status(401).json({ message: 'Not logged in' });
    }
});




app.use(express.static(__dirname + '/public'))
io.on('connection', async (socket) => {
    console.log(`a user is connected:, ${socket.id}`)

    if (socket.request.session.user) {
        const { username } = socket.request.session.user;
        console.log(`${username} connected to chat`);



    }
    
    socket.on('chatMessage', async (username) => {
        const newMessage = await knex('messages')
            .insert(
                {
                    username: username.username,
                    message: username.message
                }
            )
    
        io.emit('chatMessage', {  //displaying users message on client's end 
            username: username.username,
            message: username.message

        })
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