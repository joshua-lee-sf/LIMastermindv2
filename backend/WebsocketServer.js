// will house all of the websocketserver methods

import { createNewMultiplayerGame, joinMultiplayerGame, multiPlayerAnalyzeGuess, receiveGuess } from "./src/controllers/games.js";

export const incomingMessage = (ws, userName, message) => {
    const parsedMessage = JSON.parse(message);

    if (!parsedMessage.type || !parsedMessage.payload) {
        ws.send(JSON.stringify({
            error: "Not a valid message"
        }));
        return;
    };

    switch (parsedMessage.type) {
        case 'echo':
            echo(ws, message);
            break;
        case 'sendMasterCode':
            createNewMultiplayerGame(ws, userName, parsedMessage.payload.masterCode);
            break;
        case 'sendUserName':
            joinMultiplayerGame(ws, userName, parsedMessage.payload.userName);
        case 'sendGuess':
            receiveGuess(ws, parsedMessage.payload.guess, parsedMessage.payload.gameId);
            break;
        case 'sendAnalyzation':
            multiPlayerAnalyzeGuess(ws, parsedMessage.payload.humanNearMatch, parsedMessage.payload.humanExactMatch, parsedMessage.payload.gameId, parsedMessage.payload.guess, parsedMessage.payload.userName);
            break;
    };
};