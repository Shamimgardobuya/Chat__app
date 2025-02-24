// async  function initChat() {
//     const res = await fetch('/current-user');
//     const data = await res.json()

//     if(!data.username) {
//         alert('You need to log in first');
//         return (window.location.href = '/login');
//     }

//     const socket = io();
//     console.log(`Connected as ${data.username}`);

//     document.querySelector('#send').addEventListener('click', () => {
//         const messageText = document.getElementById('messageInput').value;
//         socket.emit('chatMessage', { message: messageText });
//     });

//     socket.on('chatMessage', ({ username, message }) => {
//         document.querySelector('.messages').innerHTML += `<li>${username}: ${message}</li>`;
//     });

// }