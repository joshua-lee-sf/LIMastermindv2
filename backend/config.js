import { config } from "dotenv";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "./src/models/User.js";
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

export const
    mongoURI = process.env.mongoURI,
    isProduction = process.env.NODE_ENV === 'production',
    secret = process.env.SECRET

passport.use(new LocalStrategy({
    session: false,
    usernameField: 'userName',
    passwordField: 'password',
}, async function (userName, password, done) {
    const user = await User.findOne({userName});
    if (user) {
        bcrypt.compare(password, user.passwordDigest, (err, isMatch) => {
            if (err || !isMatch) return done(null, false);
            return done(null, user);
        })
    } else done(null, false);
}));

export const loginUser = async user => {
    const token = await new Promise((resolve, reject) => jwt.sign(
        {userName: user.userName},
        secret,
        {expiresIn: 3600},
        (err, token) => err ? reject(err) : resolve(token)
    ));
    return {
        userName: user.userName,
        token
    };
};

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
    ignoreExpiration: !isProduction
}, async (jwtPayload, done) => {
    try {
        console.log('success')
        const user = await User.findOne({userName: jwtPayload.userName})
        if (user) return done(null, user);
        return done(null, false);
    }
    catch(err) {
        console.log('failure')
        done(err);
    }
}));

export const requireUser = passport.authenticate('jwt', { session: false });

export const restoreUser = async(req, res, next) => {
    return passport.authenticate('jwt', { session: false }, async(err, user) => {
        if (user){
            req.user = user;
        } 
        next();
    })(req, res, next);
};