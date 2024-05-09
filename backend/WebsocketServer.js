// will house all of the websocketserver methods

export const incomingMessage = (ws, message) => {
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
        case 'sendRole':
            receiveRole(ws, message);
            break;
    };
};

const receiveRole = () => {

}

// message should have mastercode and playerId

/*
Steps for websockets:

1. establish a connection to the client / other player
1a. Complete the handshake to establish a WS connection
2. Once connection is established, create game where 2 players have the same gameId
3. Have one player create and one player will have the game added to gameHistory 
    Once game is added to gameHistory, pull game into client so that they can start playing.
4. Once each player has the game in their game history, assign roles to each player" CodeBreaker / CodeMaster
5. CodeMaster will create code while CodeBreaker will wait for codebreaker to come up with code.
6. CodeBreaker will send GuessCode
7. CodeMaster will analyze code using and have it compared to computer
8. Send response back to codebreaker
9. Repeate until CurrentGame.attemptsLeft === 0 or The code gets guessed.

gameId: [user1, user2]
*/