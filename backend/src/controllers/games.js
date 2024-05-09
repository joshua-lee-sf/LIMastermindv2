import Game from "../models/Game.js";
import User from "../models/User.js";
import { secret } from "../../config.js";
import jwt from 'jsonwebtoken';

export const gameQueue = [];
export const currentPlayers = {};

const isValidGuess = (guess, masterCode) => {
    if (guess.length !== masterCode.length) return new Error('Guess is not the right length');

    return !!(guess.match(/^[0-7]+$/));
};

const createMasterCode = async (codeLength) => {
    const res = await fetch(`https://www.random.org/integers/?num=${codeLength}&min=0&max=7&col=1&base=10&format=plain&rnd=new`);

    if (!res.ok) {
        return generateRandomString(codeLength);
    };
    
    const data = await res.text();
    const masterCode = data.replace(/\n/g, "");
    return masterCode;
};

const generateRandomString = (length) => {
    const randomString = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    return randomString.match(/^[0-7]+$/) ? randomString : generateRandomString(length);
};


const isWon = (guess, masterCode) => {
    return guess.toUpperCase() === masterCode.toUpperCase() && numberOfMatches(guess, masterCode)[0] === masterCode.length;
};

const numberOfMatches = (guess, masterCode) => {
    const guessDup = guess.split('').slice();
    const masterCodeDup = masterCode.split('').slice();

    let exactCount = 0;
    let nearCount = 0;
    let i = 0;

    while (i < guessDup.length) {
        if (guessDup[i] === masterCodeDup[i]) {
            exactCount += 1;
            guessDup[i] = null;
            masterCodeDup[i] = null;
        }
        i++;
    };

    for (let j = 0; j < guessDup.length; j++) {
        let curr = guessDup[j];
        if (masterCodeDup.includes(curr) && curr !== null) {
            let index = masterCodeDup.indexOf(curr);
            masterCodeDup[index] = null;
            nearCount += 1;
        };
    };

    return [exactCount, nearCount];
};

export const createNewGame = async (req, res, next) => {
    const user = req.user;
    const {mastercodeLength, masterCode} = req.body;

    if (user && !masterCode) {
        try {
            const newGame = new Game({
                completedGame: false,
                masterCode: await createMasterCode(mastercodeLength.length > 0 ? parseInt(masterCode) : 4) ,
                players: [user.id],
                previousGuesses: [],
                attemptsLeft: 10,
            });

            if (newGame) {
                user.gameHistory.push(newGame);
                await newGame.save();
                await user.save();
                res.status(200).json({
                    success:true,
                    data: newGame.id
                })
            };
        } 
        catch (error) {
            console.log(error.message);
        }
    } 
};

export const createNewMultiplayerGame = async (ws, masterCode, jwToken) => {
    const { userName } = jwt.verify(jwToken, secret);
    const user = await User.findOne({userName});

    if (user) {
        const newMultiplayerGame = new Game({
            completedGame: false,
            masterCode,
            players: [user.id],
            previousGuesses: [],
            attemptsLeft: 10,
        });
        if (newMultiplayerGame) {
            user.gameHistory.push(newMultiplayerGame.id);
            gameQueue.push(newMultiplayerGame.id);
            currentPlayers[user.id] = newMultiplayerGame.id
        };
        await newMultiplayerGame.save();
        await user.save();

        ws.send(JSON.stringify({
            type: 'sendRole',
            payload: 'CodeBreaker'
        }));
    }
};

export const joinMultiplayerGame = async (ws, jwToken) => {
    const { userName } = jwt.verify(jwToken, secret);
    const user = await User.findOne({userName});
    const gameId = gameQueue.shift();
    const game = await Game.findById(gameId);
    game.players.push(user);
    await game.save();
    await user.save();
    
    ws.send(JSON.stringify({
        type: 'sendRole',
        payload: 'CodeMaster'
    }));
};

export const checkGuess = async (req, res, next) => {
    
    const {guess, partyId} = req.body
    const { gameId, completedGame, attemptsLeft, masterCode, previousGuesses} = req.game;
    const user = req.user;
    const validGuess = isValidGuess(guess, masterCode);
    const guessArray = alreadyGuessedCode(previousGuesses, guess);
    const alreadyGuessed = guessArray.includes(guess);
    
    if (!partyId) {

        if (!guess) {
            const error = new Error ('No code submitted');
            error.statusCode = 500;
            error.err = {message: 'No code submitted'};
            next(error);
            return;
        };

        if (alreadyGuessed) {
            const error = new Error ('Code has been tried before');
            error.statusCode = 500;
            error.err = {message: 'Code has been tried before'};
            next(error);
            return;
        };
    
        if (completedGame) {
            console.log('completed game');
            const error = new Error ('Game is already completed');
            error.statusCode = 500;
            error.err = {message: 'Game is already completed'}
            next(error);
            return
        };
        
        if (req.game && (validGuess === true) && attemptsLeft > 0 && !alreadyGuessed) {
            const [exactMatches, nearMatches] = numberOfMatches(guess, masterCode);
            previousGuesses.push(`Guess: ${guess}, Exact Matches: ${exactMatches}, Near Matches: ${nearMatches}`);
            
            if (isWon(guess, masterCode)) {
                req.game.completedGame = true;
                user.gamesRecord.wins += 1;
    
                res.json({
                    message: 'won',
                    game: req.game,
                    user
                });
                return;
            }
            
            const newAttempsLeft = attemptsLeft - 1;
            req.game.attemptsLeft = newAttempsLeft;

            if (newAttempsLeft === 0) {
                req.game.completedGame = true;
                user.gamesRecord.losses += 1;
                
                res.json({
                    game: gameId,
                    message: 'lost',
                    user,
                })
                return;
            } else if (!completedGame){
                res.json({
                    success:true,
                    gameId,
                    guess,
                    previousGuesses,
                    attemptsLeft: newAttempsLeft,
                    nearMatches,
                    exactMatches,
                });
            };
            
        } else {
            console.log('else');
            const error = new Error('Could not check guess');
            error.statusCode = 500;
            next(error);
            return;
        }
        await req.game.save();
        await user.save();
    } else {
        const {humanNearMatch, humanExactMatch} = req.body;
        const parsedExactMatch = parseInt(humanExactMatch);
        const parsedNearMatch = parseInt(humanNearMatch);

        // const {codeBreaker} = Party.parties[partyId];

        if (attemptsLeft === 0 || !isValidGuess(guess, masterCode) || completedGame || alreadyGuessed) {
            next(new Error('Could not check guess'));
            return;
        };
        
        const [computerExactMatches, computerNearMatches] = numberOfMatches(guess, masterCode);
        
        const comparator = computerAnalyzer(
            parsedNearMatch, parsedExactMatch,
            computerNearMatches,computerExactMatches
        );
    
        if (!comparator) {
            next(new Error('Human has analyzed incorrectly. Please try again.'))
            return;
        };
    
    
        if (parsedExactMatch !== masterCode.length) {
            previousGuesses.push(`Guess: ${guess}, Exact Matches: ${parsedExactMatch}, Near Matches: ${parsedNearMatch}`);
            req.game.attemptsLeft -= 1;

            if (attemptsLeft === 0) {
                res.json({
                    message: 'You have won the game.',
                    user
                });
                user.gamesRecord.wins += 1;
                
                codeBreaker.send(JSON.stringify({
                    type: 'sendResult',
                    payload: {
                        status: 'lost',
                    }
                }));
                
            } else {
                const payload = {
                    humanExactMatch,
                    humanNearMatch, 
                    attemptsLeft: req.game.attemptsLeft,
                    gameId: id,
                }
                res.json(payload);
                
                codeBreaker.send(JSON.stringify({
                    type: 'sendResponse',
                    payload
                }))
            }
        } else {
            req.game.completedGame = true;
            await req.game.save();
            
            res.json({
                message: 'You have lost the game!',
                user
            });
            user.gamesRecord.losses = user.gamesRecord.losses + 1;

            codeBreaker.send(JSON.stringify({
                type: 'sendResult',
                payload: {
                    status: 'won',
                }
            }))
        };
        await req.game.save();
        await user.save();
    };
};

const alreadyGuessedCode = (guessStringArray, guess) => {
    const guessLength = guess.length;
    const guessCodeArray = [];
    guessStringArray.forEach((guessString) => {
        const cutGuess = guessString.slice(7, guessLength + 7);
        guessCodeArray.push(cutGuess);
    })
    return guessCodeArray;
};

export const endGameEarly = async (req,res,next) => {
    const {completedGame} = req.game

    if (req.game && !completedGame) {
        const newCompletedGame = true
        req.game.completedGame = newCompletedGame;
        await req.game.save()
        res.json({
            message: "Ended the game early"
        })
    } else {
        next(new Error('Could not end game early'));
    };
};

export const getMostRecentGame = async(req,res,next) => {
    const user = await User.findOne({sessionToken: req.query.sessionToken});

    if (user) {
        const mostRecentGameIndex = user.gameHistory.length - 1
        const mostRecentGameId = user.gameHistory[mostRecentGameIndex];
        const mostRecentGame = await Game.findById(mostRecentGameId);
        const {id, completedGame, previousGuesses, attemptsLeft} = mostRecentGame;
        const masterCodeLength = mostRecentGame.masterCode.length;

        if (mostRecentGame) {
            res.status(200).json({
                id,
                completedGame, 
                previousGuesses,
                attemptsLeft,
                masterCodeLength,
            })
        } else {
            next(new Error('Could not find game'));
        }
    } else {
        next(new Error('Could not find user'))
    }
};

export const getCurrentGame = async (req, res, next) => {
    try{
        const currentGame = req.game;
        const masterCodeLength = currentGame?.masterCode.length;
    
        if (!currentGame.completedGame) {
            const {_id, completedGame, attemptsLeft, previousGuesses} = currentGame
            await res.json({
                gameId: _id,
                completedGame,
                attemptsLeft,
                previousGuesses,
                masterCodeLength,
            });
        } else {
            res.end();
        }
    } catch (err) {
        console.error(err.message);
    }
};

export const updateGameHistory = async (req, res, next) => {
    const {gameId, sessionToken} = req.body;

    if (gameId && sessionToken) {

        const game = await Game.findById(gameId);
        const user = await User.findOne({sessionToken});
    
        game.players.push(user.id);
        user.gameHistory.push(game.id);
        await game.save();
        await user.save();
    
        const masterCodeLength = game.masterCode.length
    
        await res.json({
            ..._.pick(game, ['completedGame', 'previousGuesses', 'attemptsLeft']),
            masterCodeLength,
        });
    } else {
        next (new Error ('Could not update game'));
    }
};

export const getAllGames = async (req, res, next) => {
    const user = await getCurrentUser(req.body.sessionToken);

    if (user) {
        const gamesArray = await Game.find({
            '_id': {
                $in: user.gameHistory
            }
        });
        const games = gamesArray.map((game) => _.pick(game, ['_id','completedGame', 'previousGuesses', 'attemptsLeft']));
        res.json({ 
            games
        });
    } else {
        next( new Error('Could not find user'));
    };
};

export const getHint = async (req, res, next) => {
    const currentGame = req.game
    const mastercode = currentGame.masterCode;
    let evens = 0
    let odds = 0

    if (currentGame) {
        for (let i = 0; i < mastercode.length; i++) {
            if (parseInt(mastercode[i]) % 2 === 0) {
                evens += 1
            } else {
                odds += 1
            }
        }
    }

    const hint = `There are ${odds} odd number(s) and ${evens} even number(s).`
    res.status(200).json({hint});
};