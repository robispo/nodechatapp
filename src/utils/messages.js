const generateMessage = message => {
  return {
    message,
    createdAt: new Date().getTime(),
    userName:'robispo'
  };
};

const generateLocation = (latitude, longitude) => {
  return {
    url: `https://google.com/maps?q=${latitude},${longitude}`,
    createdAt: new Date().getTime(),
    userName:'robispo'
  };
};

module.exports = {
  generateMessage,
  generateLocation
};
