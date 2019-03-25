const socket = io();

//Ellements
const eleForm = document.getElementById('fChat');
const eleMessage = document.getElementById('inpMessage');
const eleSubmit = document.getElementById('btnSubmit');
const eleSendLocation = document.getElementById('btnShareLocation');
const eleSideBar = document.getElementById('divSideBar');
const eleMessageContainer = document.getElementById('divMessageContainer');

//Templates
const eleMessageTemplate = document.getElementById('sMessageTemplate')
  .innerHTML;
const eleMessageTemplateLocation = document.getElementById(
  'sMessageTemplateLocation'
).innerHTML;
const eleSideBarContainer = document.getElementById('sSideBar').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const formatDate = timestamp => moment(timestamp).format('hh:mm a');

const autoscroll = () => {
  const eleNewMessage = eleMessageContainer.lastElementChild;
  const newMessageStyles = getComputedStyle(eleNewMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = eleNewMessage.offsetHeight + newMessageMargin;

  const vh = eleMessageContainer.offsetHeight;

  const contentHeight = eleMessageContainer.scrollHeight;

  const scrollOffset = eleMessageContainer.scrollTop + vh;

  if (contentHeight - newMessageHeight <= scrollOffset) {
    eleMessageContainer.scrollTo(0, eleMessageContainer.scrollHeight);
  }
};

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
  autoscroll();
});

socket.on('receiveLocation', data => {
  const html = Mustache.render(eleMessageTemplateLocation, {
    url: data.url,
    createdAt: formatDate(data.createdAt),
    userName: data.userName
  });
  eleMessageContainer.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(eleSideBarContainer, {
    room,
    users
  });
  eleSideBar.innerHTML = html;
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
      e => {
        eleSendLocation.disabled = false;
        if (e) {
          console.log(e);
          return;
        }
        console.log('The message was delivered!');
      }
    );
  });
});

socket.emit('join', { username, room }, e => {
  if (e) {
    alert(e);
    location.href = '/';
  }
});
