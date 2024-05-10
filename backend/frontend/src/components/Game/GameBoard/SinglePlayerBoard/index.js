import { useState } from 'react';
import './index.scss';
import { useRestoreGameQuery, useSendGuessMutation, useGetHintQuery, useEndGameEarlyMutation, useCreateNewGameMutation } from '../../../../store/loginRTKQuery';

const SinglePlayerBoard = () => {
    const [guessInput, setGuessInput] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [ errors, setErrors ] = useState('');
    const [ message, setMessage ] = useState('');
    const [ sendGuess ] = useSendGuessMutation();
    const [ endGameEarly ] = useEndGameEarlyMutation();
    const [ startNewGame ] = useCreateNewGameMutation();
    const {data: currentGame} = useRestoreGameQuery();
    const {data: hint} = useGetHintQuery();

    const handleCheckGuessButtonClick = async (e) => {
        e.preventDefault();
        const { data, error } = await sendGuess({
            guess: guessInput,
            gameId: currentGame.gameId,
        });
        if (error) {
            setErrors(error.data.message);
        } else if (data.message) {
            setMessage(data.message);
        };
    };

    const handleGetHintButtonClick = async (e) => {
        e.preventDefault();
        setShowHint(true);
    };

    const handleEndGameEarlyButtonClick = async (e) => {
        e.preventDefault();
        endGameEarly();
    };

    const handleStartNewGameButton = (e) => {
        e.preventDefault();
        startNewGame({mastercodeLength: 4});
        setShowHint(false);
        setMessage('');
        setErrors('');
    };

    return (
        <div id="guess-board">
            <h4>Please enter a {currentGame.masterCodeLength} digit code using digits 0 - 7:</h4>
            <label htmlFor="guess-input">Guess Code: </label>
            <input 
                type="number"
                id="guess-input"
                name="guess-input"
                placeholder='Enter your guess here'
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
            ></input>
            <button id='hint-button'
                onClick={(e) => handleGetHintButtonClick(e)}
            >Get Hint</button>
            <button id='check-guess-button'
                    onClick = {(e) => handleCheckGuessButtonClick(e)}
            >Check Guess</button>
            <button id='end-game-early-button'
                    onClick={(e) => endGameEarly(e)}
            >End Game</button>
            { message === "won" ? <p className="game-result">You won!</p> : null }
            { message === 'lost' ? <p className="game-result">You lost!</p> : null }
            {showHint ? <p>{hint.hint}</p> : null}
            { message?.length > 0 ? <button
                                onClick={(e) => {handleStartNewGameButton(e)}}
                        >Play again</button> : null }
            { errors?.length > 0 ? <p className="errors">{errors}</p> : null }
            <ul id='previous-guesses'>
                {
                    currentGame?.previousGuesses.map((previousGuess) => {
                        return <li>{previousGuess}</li>
                    })
                }
            </ul>
        </div>
    )
};

export default SinglePlayerBoard;