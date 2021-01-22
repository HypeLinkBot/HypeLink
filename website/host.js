const express = require('express');
const app = express();

app.use(express.static(__dirname + '/'));
app.get('/invite', (req, resp) => {
    resp.sendFile(`${__dirname}/invite.html`);
});

app.listen(80);