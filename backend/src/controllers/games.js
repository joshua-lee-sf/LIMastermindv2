import Game from "../models/Game.js";
import User from "../models/User.js";
import Party from '../../Party.js';

const isValidGuess = (guess, masterCode) => {
    if (guess.length !== masterCode.length) return new Error('Guess is invalid');

    return !!(guess.match(/^[1-7]+$/));
};

const createMasterCode = async (codeLength = 4) => {
    const res = await fetch(`https://www.random.org/integers/?num=${codeLength}&min=0&max=7&col=1&base=10&format=plain&rnd=new`);
    
    if (!res.ok) {
        res.send({
            masterCode: ""
        })
    };
    
    const data = await res.text();
    const masterCode = data.replace(/\n/g, "");
    return masterCode;
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
    const user = await User.findOne({sessionToken: req.body.sessionToken});
    const {codeLength, masterCode} = req.body;

    if (user) {
        try {
            const newGame = new Game({
                completedGame: false,
                masterCode: masterCode ?? await createMasterCode(codeLength),
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
            next(new Error(error));
        }
    }
};

export const checkGuess = async (req, res, next) => {
    const {guess, sessionToken, game, partyId} = req.body;
    const user = await User.findOne({sessionToken});
    const currentGame = await Game.findById(game);
    const masterCode = currentGame.masterCode;
    const validGuess = isValidGuess(guess, currentGame.masterCode);
    const guessArray = alreadyGuessedCode(currentGame.previousGuesses, guess);
    const alreadyGuessed = guessArray.includes(guess);
    
    if (!partyId) {
        

        if (alreadyGuessed) {
            next(new Error ('Code has been tried before'));
        }
    
        if (currentGame.completedGame) {
            next(new Error('Game is already completed'));
        };
        
        if (currentGame && (validGuess === true) && currentGame.attemptsLeft > 0 && !alreadyGuessed) {
            const masterCode = currentGame.masterCode;
            const [exactMatches, nearMatches] = numberOfMatches(guess, masterCode);
            currentGame.previousGuesses.push(`Guess: ${guess}, Exact Matches: ${exactMatches}, Near Matches: ${nearMatches}`);
            
            if (isWon(guess, masterCode)) {
                currentGame.completedGame = true;
                user.score.wins += 1;
    
                res.status(200).send({
                    message: 'You have won the game!',
                    game: currentGame,
                    user
                });
            }
            
            currentGame.attemptsLeft -= 1;
            const attemptsLeft = currentGame.attemptsLeft;

            if (currentGame.attemptsLeft === 0) {
                currentGame.completedGame = true;
                user.score.losses += 1;
                
                res.status(200).json({
                    success: true,
                    game: currentGame._id,
                    message: 'Sorry you have lost the game',
                    user,
                })
                
            } else if (!currentGame.completedGame){
                res.status(200).json({
                    success:true,
                    game: currentGame._id,
                    guess: guess,
                    attemptsLeft: attemptsLeft,
                    nearMatches: nearMatches,
                    exactMatches: exactMatches,
                });
            };
            
        } else {
            next( validGuess ? validGuess : new Error('Guess is out of bounds'));
        }
        await currentGame.save();
        await user.save();
    } else {
        const {humanNearMatch, humanExactMatch} = req.body;
        const parsedExactMatch = parseInt(humanExactMatch);
        const parsedNearMatch = parseInt(humanNearMatch);

        const {codeBreaker} = Party.parties[partyId];

        if (currentGame.attemptsLeft === 0 || !isValidGuess(guess, masterCode) || currentGame.completedGame || alreadyGuessed) {
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
            currentGame.previousGuesses.push(`Guess: ${guess}, Exact Matches: ${parsedExactMatch}, Near Matches: ${parsedNearMatch}`);
            currentGame.attemptsLeft -= 1;

            if (currentGame.attemptsLeft === 0) {
                res.json({
                    message: 'You have won the game.',
                    user
                });
                user.score.wins += 1;
                
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
                    attemptsLeft: currentGame.attemptsLeft,
                    gameId: currentGame.id,
                }
                res.json(payload);
                
                codeBreaker.send(JSON.stringify({
                    type: 'sendResponse',
                    payload
                }))
            }
        } else {
            currentGame.completedGame = true;
            await currentGame.save();
            
            res.json({
                message: 'You have lost the game!',
                user
            });
            user.score.losses += 1;

            codeBreaker.send(JSON.stringify({
                type: 'sendResult',
                payload: {
                    status: 'won',
                }
            }))
        };
        await currentGame.save();
        await user.save();
    };
};

const alreadyGuessedCode = (guessStringArray, guess) => {
    const guessLength = guess.length;
    const guessCodeArray = [];
    guessStringArray.forEach((guessString) => {
        guessCodeArray.push(guessString.slice(7, guessLength + 7));
    })
    return guessCodeArray;
};

export const endGameEarly = async (req,res,next) => {
    const currentGame = await Game.findById(req.body.game);
    const completedGame = currentGame.completedGame;

    if (currentGame && !completedGame) {
        currentGame.completedGame = true
        await currentGame.save()
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
        const gameId = req.query.gameId;
        const game = await Game.findById(gameId);
        const masterCodeLength = game?.masterCode.length;
    
        
        if (game) {
            const {completedGame, attemptsLeft, previousGuesses} = game
            await res.json({
                completedGame,
                attemptsLeft,
                previousGuesses,
                masterCodeLength,
            });
        } else {
            next(new Error ('Could not continue game'));
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
    const currentGame = await Game.findById(req.body.game);
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