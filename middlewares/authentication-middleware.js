const jwt = require('jwt-simple');
const config = require('../config');

module.exports = {
    authorization,
    jwtEncoding,
    jwtDecoding
}


function authorization(req, res, next) {
    const payload = (req.headers.authorization).split(' ')[1];
    if (payload) {
        // console.log(jwt.decode(payload,config.JWT_SECRET))  
        next();
    } else {
        res.status(403).send('please make sure your request has authorization header')
    }
}

function jwtEncoding(obj) {
    return jwt.encode(obj, config.JWT_SECRET);
}

function jwtDecoding(token) {
    console.log('[JWT-TOKEN-DECODE]')
    let payload = jwt.decode(token, config.JWT_SECRET)
    return payload
}