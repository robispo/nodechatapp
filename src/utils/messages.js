const generateMessage = (message, userName) => {
  return {
    message,
    createdAt: new Date().getTime(),
    userName
  };
};

const generateLocation = (latitude, longitude, userName) => {
  return {
    url: `https://google.com/maps?q=${latitude},${longitude}`,
    createdAt: new Date().getTime(),
    userName
  };
};

module.exports = {
  generateMessage,
  generateLocation
};
