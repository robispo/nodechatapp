const socket = io();
const eleForm = document.getElementById('fChat');
const eleMessage = document.getElementById('inpMessage');
const eleSubmit = document.getElementById('btnSubmit');
const eleSendLocation = document.getElementById('btnShareLocation');
const eleMessageContainer = document.getElementById('divMessageContainer');
const eleMessageTemplate = document.getElementById('sMessageTemplate')
  .innerHTML;
const eleMessageTemplateLocation = document.getElementById(
  'sMessageTemplateLocation'
).innerHTML;

const formatDate = timestamp => moment(timestamp).format('hh:mm a');

socket.on('Welcome', greetings => {
  console.log(greetings);
});

socket.on('receiveMessage', message => {
  const html = Mustache.render(eleMessageTemplate, {
    message: message.message,
    createdAt: formatDate(message.createdAt),
    userName: message.userName
  });
  eleMessageContainer.insertAdjacentHTML('beforeend', html);
});

socket.on('receiveLocation', data => {
  const html = Mustache.render(eleMessageTemplateLocation, {
    url: data.url,
    createdAt: formatDate(data.createdAt),
    userName: data.userName
  });
  eleMessageContainer.insertAdjacentHTML('beforeend', html);
});

eleForm.addEventListener('submit', e => {
  e.preventDefault();
  eleForm.disabled = true;
  eleSubmit.disabled = true;

  const form = e.target.elements;

  socket.emit('sendMessage', form.message.value, e => {
    eleForm.disabled = false;
    eleSubmit.disabled = false;
    eleMessage.value = '';
    eleMessage.focus();

    if (e) {
      console.log(e);
      return;
    }
    console.log('The message was delivered!');
  });
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
