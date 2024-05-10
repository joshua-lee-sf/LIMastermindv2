import './index.scss'
import { useCreateNewGameMutation } from '../../../store/loginRTKQuery';
import { useState } from 'react';
import SinglePlayer from './SinglePlayer';
import MultiPlayerGameBoard from '../GameBoard/MultiPlayerBoard';
import useWebSocket from 'react-use-websocket';

const StartGame = () => {
    const [createNewGame, {isLoading}] = useCreateNewGameMutation();
    const [ hideSinglePlayer, setHideSinglePlayer ] = useState(false);
    const [ showLoadingMessage, setShowLoadingMessage] = useState(false);
    const [ hideMultiplayerButton, setHideMultiplayerButton] = useState(false);
    const [ hideMultiPlayerGameBoard, setHideMultiPlayerGameBoard] = useState(true);

    const handleStartMultiplayerGameButtonClick = async (event, mastercodeLength, userName) => {
        event.preventDefault();
        setHideSinglePlayer(true);
        setShowLoadingMessage(true);
        setHideMultiplayerButton(true);
        setHideMultiPlayerGameBoard(false);
    };

    return(
        <>
            <div id="start-game-button-div">
                { !hideSinglePlayer ? <SinglePlayer/> : null}
                <div 
                    id="multiplayer-button-div"
                    hidden={hideMultiplayerButton}
                >
                    <button 
                        className="start-game-button"
                        onClick={(e) => handleStartMultiplayerGameButtonClick(e)}
                    >
                        Start Multiplayer Game
                    </button>
                    {!showLoadingMessage ? null : <p>Waiting for other player to join...</p>}
                </div>
            </div>
            {!hideMultiPlayerGameBoard && <MultiPlayerGameBoard/>}
        </>
    )
};

export default StartGame;