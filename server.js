const express = require('express')
const app = express()

app.use(express.static('.'))

app.get('/', function (req, res) {
  res.sendFile('index.html')
})

app.listen(3000, function () {
  console.log('App listening on port 3000!')
})
