const express = require('express');
const uuid = require('uuid')
const session = require('express-session')
const fileStore = require('session-file-store')(session)
const bodyParser = require('body-parser')
const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const axios = require('axios')

const app = express();
const port = process.env.PORT || 3000

const jsonServer = 'http://localhost:5000'

passport.use(new localStrategy(
  {usernameField: 'email'},
  (email, password, done) => {
    axios.get(jsonServer + '/users?email=' + email)
    .then(res => {
      let user = res.data[0]
      if (!user) {
        return done(null, false, {message: "user doesn't exist"});
      } else if (password != user.password) {
        return done(null, false, {message: 'password incorrect'})
      } else {
        return done(null, user);
      }
    })
    .catch(error => done(error))
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  axios.get(jsonServer + '/users/' + id)
  .then(res => done(null, res.data))
  .catch(error => done(error, false))
})

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(session({
  genid: (req) => {
    return uuid()
  },
  store: new fileStore(),
  secret: 'not a secret',
  resave: false,
  saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  res.send('yes is working. ID: ' + req.sessionID)
})

app.get('/login', (req, res) => {
  res.send('got login page')
})

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (info) {return res.send(info.message)}
    if (err) {return next(err)}
    if (!user) {return res.redirect('/login')}
    req.login(user, (err) => {
      if (err) {return next(err)}
      return res.redirect('/authrequired');
    })
  })(req, res, next);
})

app.get('/authrequired', (req, res) => {
  if (req.isAuthenticated()){
    res.send('you hit an authentication required endpoint')
  } else {
    res.redirect('/')
  }
})

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/')
})

app.listen(port, () => {
  console.log('listening on port: ' + port)
})
