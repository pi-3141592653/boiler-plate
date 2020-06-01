
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlengh:5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    imange: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
});


userSchema.pre('save', function( next ){
    var user = this;

    if(user.isModified('password')) { //비밀번호를 바꿀경우 
        //비밀번호를 암호화 시킨다
        bcrypt.genSalt(saltRounds,function(err,salt){
            if(err) return next(err)

            bcrypt.hash(user.password, salt, function(err,hash){
                if(err) return next(err)

                user.password = hash
                next()
            })
        })
    } else { //비밀번호를 바꾸는 경우 외 처리
        next()
    }
})


userSchema.methods.comparePassword = function(plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function(err,isMatch){
        if(err) return cb(err)
        cb(null,isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    var token = jwt.sign(user._id.toHexString(), 'secretToken');
    user.token = token;
    user.save (function(err,user) {
        if(err) return cb(err)
        cb(null, user)
    });
}

userSchema.statics.findByToken = function(token, cb) {
    var user = this;
    
    //토큰을 decode
    jwt.verify(token, "secretToken", function(err, decoded){
        //userid를 이용해서 userid 찾은다음
        //token을 비교
        user.findOne({"_id":decoded,"token": token}, function(err,user){
            if(err) return cb(err);
            cb(null,user)
        })
    })
}

const User = mongoose.model('User', userSchema);
module.exports = { User }