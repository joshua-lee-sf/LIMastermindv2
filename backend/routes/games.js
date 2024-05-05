import { Router } from "express";
import {createNewGame, checkGuess, endGameEarly, getAllGames, getCurrentGame, updateGameHistory, getHint} from "../controllers/games.js";

const gameRouter = Router();

gameRouter.post('/newgame', createNewGame);
gameRouter.post('/checkguess', checkGuess);
gameRouter.post('/updategamehistory', updateGameHistory);
gameRouter.post('/endgameearly', endGameEarly);
gameRouter.get('/getallgames', getAllGames);
gameRouter.get('/getcurrentgame', getCurrentGame);
gameRouter.get('/gethint', getHint);

export default gameRouter;