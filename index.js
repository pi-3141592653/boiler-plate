const express = require('express');
const app = express();
const port = 3000

const { User } = require("./models/User");

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

mongoose.connect(
    'mongodb+srv://jello:asdf1234@cluster0-wn8m9.mongodb.net/test?retryWrites=true&w=majority', 
    {useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false}
).then(() => console.log('MongoDB Connected...'))
 .catch(err => console.log(err));

app.get('/', (req,res) => res.send('Hello World!'));

app.post('/register',(req,res) => {
    //회원가입에 필요한 정보를 가져옴
    // 가져온 정보를 데이터베이스에 입력
    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({sucess: false, err})
        return res.status(200).json({
            sucess: true
        })
    })
});

app.listen(port,() => console.log(`Example app listening on port ${port}!`))