import './index.scss'
import { useCreateNewGameMutation } from '../../../store/loginRTKQuery';
import { useState } from 'react';
import SinglePlayer from './SinglePlayer';

const StartGame = () => {
    const [createNewGame, {isLoading}] = useCreateNewGameMutation();
    const [ hideSinglePlayer, setHideSinglePlayer ] = useState(false);
    const [ showLoadingMessage, setShowLoadingMessage] = useState(false);

    const handleStartMultiplayerGameButtonClick = async (event, mastercodeLength, userName) => {
        event.preventDefault();
        setHideSinglePlayer(true);
        setShowLoadingMessage(true);
        
    };

    return(
        <div id="start-game-button-div">
            { !hideSinglePlayer ? <SinglePlayer/> : null}
            <button 
                className="start-game-button"
                onClick={(e) => handleStartMultiplayerGameButtonClick(e)}
            >
                Start Multiplayer Game
            </button>
            {!showLoadingMessage ? null : <p>Waiting for other player to join...</p>}
        </div>
    )
};

export default StartGame;