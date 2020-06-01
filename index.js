const express = require('express');
const app = express();
const port = 3000

const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());


const config = require('./config/key');
mongoose
    .connect(
        config.mongoURI, 
        {useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, useFindAndModify:false}
    )
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

app.get('/', (req,res) => res.send('Hello World!!!'));

app.post('/api/users/register',(req,res) => {
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

app.post('/api/users/login', (req,res)=> {
    // 이메일 확인
    User.findOne({ email: req.body.email }, (err,user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            });
        }

        // 비번 확인
        user.comparePassword(req.body.password, (err,isMatch) => {
            if(!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})

            // 로그인 토큰 생성
            user.generateToken((err,user) => {
                if(err) return res.status(400).send(err);
                
                // 토큰을 저장
                res.cookie("x_auth", user.token)
                   .status(200)
                   .json({loginSuccess: true, userId: user._id});
            });
        });
    });
});

app.get('/api/users/auth', auth, (req,res) => {
    // 여기까지 middleware를 통과했다는 말은 인증 성공임
    res.status(200).json({
        _id: req.user.userId,
        isAdmin: req.token.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
});

app.get('/api/users/logout', auth, (req,res) => {
    
    User.findOneAndUpdate(
        {_id: req.user._id}, 
        {token: ""}, 
        (err,user) => {
            if(err) return res.json({ success: false, err});
            return res.status(200).send({
                success: true
            })
    })
});

app.listen(port,() => console.log(`Example app listening on port ${port}!`));