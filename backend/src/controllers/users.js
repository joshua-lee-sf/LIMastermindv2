import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import session from "express-session";
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
    const { token } = await loginUser(newUser);
    res.json({
        userName: newUser.userName,
        token
    });
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
        return res.json(await loginUser(user));
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