import express from 'express';
import { errorHandle } from './utils/errorHandle.mjs';
import phaseController from './controllers/phaseController.mjs';
import userController from './controllers/userController.mjs';
import voteController from './controllers/voteController.mjs';
import proposalController from './controllers/proposalController.mjs';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { generateRandom, generateHash, isAuthenticatedUser } from './utils/security.mjs';
import UserDto from './dto/userDto.mjs';
import db from './utils/db.mjs';
import cors from 'cors';


const port = 3001;

const userDto = new UserDto(db);

const corsConfig = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true

};

// init express
const app = new express();
app.use(cors(corsConfig));
app.use(express.json());
app.use(
  session({
    secret: generateRandom(64),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict', 
      maxAge: 1000 * 60 * 60 
    }
  })
);


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await userDto.getUserByUsername(username);
    if (!user) {
      return done(null, false, { message: 'Incorrect username.', type: 'UNAUTHENTICATED' });
    }
    if (user.password !== generateHash(password, user.salt)) {
      return done(null, false, { message: 'Incorrect password.', type: 'UNAUTHENTICATED' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});



app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.status(401).json(info); }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.json({
        id: user.id,
        username: user.username,
        role: user.role
      });
    });
  })(req, res, next);
});



app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    } else {
      res.json({ message: 'Logout successful' });
    }
  });
});


app.get('/auth', isAuthenticatedUser, async (req, res, next) => {
  res.json({ message: 'Authenticated' });
});


app.use("/phase", phaseController);
app.use("/user", userController);
app.use("/proposal", proposalController);
app.use("/vote", voteController);

app.use(errorHandle);
// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});