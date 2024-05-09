import { Router } from "express";
import { restoreUser,restoreGame } from "../../config.js";
import {createNewGame, checkGuess, endGameEarly, getAllGames, getCurrentGame, updateGameHistory, getHint} from "../controllers/games.js";

const gameRouter = Router();

gameRouter.post('/newgame', restoreUser, createNewGame);
gameRouter.post('/checkguess', restoreUser, restoreGame, checkGuess);
gameRouter.post('/updategamehistory', updateGameHistory);
gameRouter.post('/endgameearly', restoreUser, restoreGame, endGameEarly);
gameRouter.get('/getallgames', getAllGames);
gameRouter.get('/getcurrentgame', restoreUser, restoreGame, getCurrentGame);
gameRouter.get('/gethint', restoreUser, restoreGame, getHint);

export default gameRouter;