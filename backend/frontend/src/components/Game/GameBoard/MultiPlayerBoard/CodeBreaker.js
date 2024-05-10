import { useState } from "react";
import useWebSocket from "react-use-websocket";
import { useEffect } from "react";
import { useRestoreGameQuery, useRestoreUserQuery } from "../../../../store/loginRTKQuery";

const CodeBreaker = ({hideGuessSubmit, currentGame, attemptsLeft, previousGuesses, setHideGuessSubmit, status}) => {
    const [guess, setGuess ] = useState('');
    const socketUrl = 'ws://localhost:5000';
    const {data: currentUser} = useRestoreUserQuery();
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(socketUrl, {share: true});
    
    const handleSubmitGuessButtonClick = (e) => {
        e.preventDefault();
        sendJsonMessage({
            type: 'sendGuess',
            payload: {
                guess,
                gameId: currentGame
            }
        });
        setHideGuessSubmit(!hideGuessSubmit);
    };

    useEffect(() => {

    }, [hideGuessSubmit, attemptsLeft, previousGuesses]);

    return (
        <>
            { hideGuessSubmit ? 
                <p>Please wait for the other user to set the code! </p> : 
                <div>
                    <p>Please enter a guess!</p>
                    { attemptsLeft ?  <p>Attempts Left: {attemptsLeft}.</p> : <p>Attempts Left: 10</p> }
                    <input
                        type="number"
                        placeholder="Enter your guess here:"
                        onChange={(e) => setGuess(e.target.value)}
                    >   
                    </input>
                    <button
                        onClick={(e) => {handleSubmitGuessButtonClick(e)}}
                    >Submit Guess Button</button>
                    {previousGuesses?.map((previousGuess, i) => (
                        <p key={i}>{previousGuess}</p>
                    ))}
                </div> }
                {status ? <h3>You {status}!!</h3> : null}
        </>
    )
};

export default CodeBreaker;