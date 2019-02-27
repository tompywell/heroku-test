const express = require('express');
const app = express();
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('yes is working')
  console.log('someone loaded the page')
})

app.listen(port, () => {
  console.log('listening on port: ' + port)
})
