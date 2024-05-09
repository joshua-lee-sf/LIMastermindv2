import { useCreateNewGameMutation } from "../../../store/loginRTKQuery";
import { useState } from "react";

const SinglePlayer = () => {
    const [ createNewGame ] = useCreateNewGameMutation();
    const [mastercodeLength, setMastercodeLength] = useState('');

    const handleStartSinglePlayerGameButtonClick = async (event) => {
        event.preventDefault();
        const {data} = await createNewGame({
            mastercodeLength,
        });
    };

    return(
        <div id="single-player-options-div">
            <input id="mastercode-length-input"
                    type="number"
                    placeholder="Master Code Length" 
                    value={mastercodeLength} 
                    onChange={(e) => {{
                        setMastercodeLength(e.target.value);
                    }}
            }></input>
            <button className="start-game-button"
                    onClick={handleStartSinglePlayerGameButtonClick}    
            >Start Single Player Game</button>
        </div>
    )
};

export default SinglePlayer;