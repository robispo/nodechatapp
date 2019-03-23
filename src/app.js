const server = require('./index');

const port = process.env.PORT;

server.listen(port, () => console.log(`Server is up in port ${port}!`));