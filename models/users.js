var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    birthDate: {
        type: Date,
    },
    avatar: {
        type: mongoose.Schema.Types.Mixed, required: false
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = function (candidatePassword, hashedPassword, callback) {
    console.log('[DEBUG] req.body.passowrd : ', candidatePassword)
    console.log('[DEBUG] req.body.passowrd : ', hashedPassword)
    
    // Load hash from your password DB.
    bcrypt.compare(candidatePassword, hashedPassword, function (err, res) {
        if (err) {
            console.log(err);
            throw err
        }
        if (res === true) {
            callback(null, res)
        } else {
            callback("errrr", null)
        }
        // res === true
    });

}

module.exports.getUserByPhoneNumber = function (phoneNumber, callback) {
    var query = { phoneNumber: phoneNumber }
    User.findOne(query, callback)
};

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            // hash passowrd
            newUser.password = hash
            // create user
            newUser.save(callback);
        });
    });
};