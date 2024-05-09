import './index.scss'
import { useCreateNewGameMutation } from '../../../store/loginRTKQuery';
import { useState } from 'react';
import SinglePlayer from './SinglePlayer';

const StartGame = () => {
    const [createNewGame, {isLoading}] = useCreateNewGameMutation();
    const [ hideSinglePlayer, setHideSinglePlayer ] = useState(false)

    const handleStartMultiplayerGameButtonClick = async (event, mastercodeLength, userName) => {
        event.preventDefault();
    };

    return(
        <div id="start-game-button-div">
            { !hideSinglePlayer ? <SinglePlayer/> : null}
            <button className="start-game-button">Start Multiplayer Game</button>
        </div>
    )
};

export default StartGame;