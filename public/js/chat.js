const socket = io()

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('click')
//     socket.emit('increment')
// })

// Elements
const $messageForm = document.querySelector('#mesg')
const $messageFormInput = document.querySelector('input')
const $messageFormInputButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const mesgTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const autoScroll = () => {
    // new message elements
    const $newMessage = $messages.lastElementChild

    // height of the new mesasge
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageHeight = $newMessage.offSetHeight

    // visable height
    const visableHeight = $messages.offSetHeight

    // height of messages height
    const containerHeight = $messages.scrollHeight

    // how far i scrolled
    const scrollOffset = $messages.scrollTop + visableHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// Listen on message event from server and render a template with message text and format time
socket.on('message', (message) => {

    const html = Mustache.render(mesgTemplate, {
        username: message.username,
        message: message.text,
        createAt: moment(message.createAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({
    room,
    users
}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

// Listen on locationMessage event from server and render a template with locaction mesg url
// and format time
socket.on('loactionMessage', (message) => {

    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

// Send message request to server
$messageForm.addEventListener('submit', e => {
    e.preventDefault();

    $messageFormInputButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormInputButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    });
});

// Send geolocation message request to server
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return console.log('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, () => {
            console.log('Location shared!')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})



socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})