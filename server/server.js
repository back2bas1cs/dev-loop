const express = require('express');

const app = express();
const PORT = process.env.PORT || 3030;

app.get('/', () => res.json('lezzzgooo'));



app.listen(PORT, () => {
  console.log(`listening on ${PORT}...`);
});
