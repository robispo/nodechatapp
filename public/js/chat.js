const socket = io();
const eleUserName = document.getElementById('inpUserName');
const eleMessage = document.getElementById('taMessage');

socket.on('Welcome', greetings => {
  console.log(greetings);
});

socket.on('receiveMessage', message => {
  console.log(message);
});

document.getElementById('fChat').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target.elements;

  socket.emit(
    'sendMessage',
    {
      userName: form.userName.value,
      message: form.message.value
    },
    message => console.log('The message was delivered!', message)
  );
});

document.getElementById('btnShareLocation').addEventListener('click', e => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit('shareLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  });
});
