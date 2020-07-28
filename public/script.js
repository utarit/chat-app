const socket = io('/')
const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const peers = {}
const grid = document.getElementById('grid')
const video = document.createElement('video')
video.muted = true

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(video, stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', videoStream => {
            addVideoStream(video, videoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
    
})


socket.on('user-connected', (userId) => {
    console.log('User connected: ' + userId)
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})


function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    grid.append(video)
}

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', videoStream => {
        addVideoStream(video, videoStream)
    })

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}