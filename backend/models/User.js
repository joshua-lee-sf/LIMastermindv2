import { model, Schema } from 'mongoose';

const userSchema = new Schema({
    userName: {
        type: String,
        minLength: 2,
        required: true,
        unique: true,
    },
    passwordDigest: {
        type: String,
        required: true,
    },
    sessionToken: {
        type: String,
        required: true,
        unique: true
    },
    gameHistory: [
        {type: Schema.Types.ObjectId,
        ref: 'Game'}
    ],
    gamesRecord: {
        wins: {
            type: Number,
            required: true
        },
        losses: {
            type: Number,
            required: true
        }
    }
});

export default model('User', userSchema);