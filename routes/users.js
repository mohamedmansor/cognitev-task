var express = require('express');
const { check, validationResult } = require('express-validator/check');
var router = express.Router();
var User = require('../models/users')
var jwt = require('jwt-simple');
const moment = require('moment')
const authorizationMiddleWare = require('../middlewares/authentication-middleware').authorization;
const jwtEncoding = require('../middlewares/authentication-middleware').jwtEncoding;
const jwtDencoding = require('../middlewares/authentication-middleware').jwtDecoding;
const multer = require('multer');

// upload file logic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.json({ 'message': "Wecome to our API" })
});


let middleWareChecker = [
  // username must be an email
  check('email').isEmail(),
  // password must be at least 6 chars long
  check('password').isLength({ min: 8 }),
  // check mobile number
  check('phoneNumber').isLength({ max: 11 })
]


/**
 * request.firstName
 * request.lastName
 * request.email
 * request.phoneNumber
 * request.password
 * request.countryCode
 * request.phoneNumber
 * request.gender
 * request.birthDate
 * request.avatar
 * response.201 Created
 */

router.post('/register', middleWareChecker, upload.single('avatar'), function (req, res, next) {
  console.log(req.file)
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let countryCode = req.body.countryCode;
  let phoneNumber = req.body.phoneNumber;
  let gender = req.body.gender;
  let birthDate = req.body.birthDate;
  let avatar = req.file.path;

  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  User.find({ "phoneNumber": req.body.phoneNumber }, function (err, user) {
    if (user.length > 0 && user[0].email == req.body.email) {
      console.log('[DEBUG] user', user)
      console.log("phone number is already exsist ...!");
      res.status(400).json({ msg: 'The phone number you have entered is already associated with another account.' })
    } else {

      let newUser = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        countryCode: countryCode,
        phoneNumber: phoneNumber,
        gender: gender,
        birthDate: birthDate,
        avatar: avatar
      })
      // Create new user
      User.createUser(newUser, function (err, user) {
        if (err) {
          console.log('[CREATE USER ERR]', err)
        }
        res.status(201).json(user);
        console.log('[Create New User] ', user)
      });
    }
  });
});


// authenticate
/**
 * request.phoneNumber
 * request.password
 * Response 200 OK
 * response.accessToken
 */
router.post('/authenticate', function (req, res, next) {
  // return JWT Toekn for login
  if (req.body.phoneNumber && req.body.password) {
    User.find({ "phoneNumber": req.body.phoneNumber }, function (err, user) {
      if (err) {
        console.log(err);
      }
      else {
        console.log('USER-', user)
        if (user.length > 0) {
          User.comparePassword(req.body.password, user[0].password, function (err, isMatch) {
            if (err) {
              console.log('Err', err)
            }
            const payload = {
              data: user[0],
              iat: moment().format('YYYY-MM-DD'),
              exp: moment().add(1, 'months').format('YYYY-MM-DD')
            }
            const Token = jwtEncoding(payload)
            res.status(200).json({ accessToken: Token });
          })
        } else {
          res.status(400).json("Invalid phone number or Password")
        }
      }
    });

  } else {
    res.status(400).json("Invalid_Paramters")
  }
});


router.post('/login', function (req, res, next) {
  if (req.body.phoneNumber && req.body.accessToken) {
    User.find({ 'phoneNumber': req.body.phoneNumber }, function (err, isMatch) {
      if (err) {
        console.log('err', err)
        res.status(400).json({ 'error': "Something went wrong" })
      } else {
        const payload = jwtDencoding(req.body.accessToken)
        const now = moment().unix();
        if (now > payload.exp) {
          res.status(401).json({
            "error": "Invalid_Paramters ",
            'message': "Token and phone Number compination"
          })
        } else {
          res.status(200).json({
            "status": "SUCCESS",
            "data": payload.data
          })
        }
      }
    })
  } else {
    res.status(400).json("Invalid_Paramters")
  }

})

module.exports = router;