import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import passport from "passport";
import { loginUser } from "../../config.js";


const createPasswordDigest = async (password) => {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
};

const generateSessionToken = async () => {
    const token = crypto.randomBytes(16).toString('base64url');
    return (await User.findOne({sessionToken: token})) ? generateSessionToken() : token
};

const isPassword = async (username, password) => {
    const user = await User.findOne({userName: username});
    if (user) return bcrypt.compare(password, user.passwordDigest);
};

export const createNewUser = async (req, res, next) => {
        const checkUser = await User.findOne({userName: req.body.userName});
        if (checkUser) return next(new Error('Username is already taken'));
        console.log(req.body.userName, req.body.password);
        if (!!req.body.userName === false) return next(new Error('Username is missing'));
        if (!!req.body.password === false) return next(new Error('Password is missing'));

        const newUser = new User({
            userName: req.body.userName,
            passwordDigest: await createPasswordDigest(req.body.password),
            sessionToken: await generateSessionToken(),
            gameHistory: [],
            gamesRecord: {
                wins: 0,
                losses: 0,
            }
        });

        
        await newUser.save();
        const payload = await loginUser(newUser);
        res.cookie('jwt', payload.token).json(payload);
};

export const loginUserRoute = async (req, res, next) => {
    passport.authenticate('local', async function (err, user) {
        if (err) return next(err);
        if (!user) {
            const err = new Error('Invalid  credentials');
            err.statusCode = 400;
            err.errors = {credentials: 'Invalid Credentials'};
            return next(err)
        };
        const payload = await loginUser(user);
        return res.cookie('jwt', payload.token).json(payload);
    }) (req, res, next);
};

export const getCurrentUser = async (req, res, next) => {
    const token = req.query.sessionToken;
    let user = await User.findOne({sessionToken: token});
    
    if (!user) {
        next(new Error('Could not find user'));
    } else {
        res.status(200).send(JSON.stringify(user));
    };
};

export const restoreUserController = async (req,res, next) => {
    if (req.user) {
        res.json({
            userName: req.user.userName,
            token: req.get('Authorization').slice(6)
        })
    } else {
        res.status(404).end();
    }
}

export const updateUserScore = async (req, res, next) => {
    const {sessionToken, status} = req.body;

    if (sessionToken) {
        const user = await User.findOne({sessionToken});
        status === "won" ? user.gamesRecord.wins += 1 : user.gamesRecord.losses += 1;
        await user.save();
        await res.json({
            gamesRecord: user.gamesRecord
        });
    } else {
        next (new Error ('Could not update game'));
    }
};