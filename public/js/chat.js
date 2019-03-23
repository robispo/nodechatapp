const socket = io();
const eleForm = document.getElementById('fChat');
const eleMessage = document.getElementById('inpMessage');
const eleSubmit = document.getElementById('btnSubmit');
const eleSendLocation = document.getElementById('btnShareLocation');

socket.on('Welcome', greetings => {
  console.log(greetings);
});

socket.on('receiveMessage', message => {
  console.log(message);
});

eleForm.addEventListener('submit', e => {
  e.preventDefault();
  eleForm.disabled = true;
  eleSubmit.disabled = true;

  const form = e.target.elements;

  socket.emit(
    'sendMessage',
    {
      userName: form.userName.value,
      message: form.message.value
    },
    e => {
      eleForm.disabled = false;
      eleSubmit.disabled = false;
      eleMessage.value = '';
      eleMessage.focus();

      if (e) {
        console.log(e);
        return;
      }
      console.log('The message was delivered!');
    }
  );
});

eleSendLocation.addEventListener('click', e => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }
  eleSendLocation.disabled = true;

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'shareLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        eleSendLocation.disabled = false;

        console.log('The message was delivered!');
      }
    );
  });
});
