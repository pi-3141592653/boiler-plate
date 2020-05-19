const express = require('express')
const app = express()
const port = 3000

const mongoose = require('mongoose')
mongoose.connect(
    'mongodb+srv://jello:asdf1234@cluster0-wn8m9.mongodb.net/test?retryWrites=true&w=majority', 
    {useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false}
).then(() => console.log('MongoDB Connected...'))
 .catch(err => console.log(err))



app.get('/', (req,res) => res.send('Hello World!'))
app.listen(port,() => console.log(`Example app listening on port ${port}!`))