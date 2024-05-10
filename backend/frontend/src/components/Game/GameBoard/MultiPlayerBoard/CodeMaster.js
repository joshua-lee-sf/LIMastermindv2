import { useSelector } from "react-redux";
import { newURIGenerator } from "./index.js";
import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { useRestoreUserQuery } from "../../../../store/loginRTKQuery.js";

const CodeMaster = ({receivedGuess, incomingGuess, codeMasterGameId, attemptsLeft, previousGuesses, setReceivedGuess, status}) => {
    // const socketUrl = newURIGenerator();
    const socketUrl = 'ws://localhost:5000';
    const { sendJsonMessage } = useWebSocket(socketUrl, {share: true});
    const [ masterCodeCreated, setMasterCodeCreated ] = useState(false);
    const { data:currentUser } = useRestoreUserQuery();
    const [ exactMatches, setExactMatches ] = useState('');
    const [ nearMatches, setNearMatches ] = useState('');
    const [ masterCode, setMasterCode ] = useState('');

    const handleSubmitMasterCodeButtonClick = (e) => {
        e.preventDefault();
        setMasterCodeCreated(true);
        sendJsonMessage({
            type: 'sendMasterCode',
            payload: {
                masterCode,
                guessCheck: true,
                userName: currentUser.userName
            }
        });
    };

    const handleSubmitAnalyzationButtonClick = (e) => {
        e.preventDefault();
        sendJsonMessage({
            type: 'sendAnalyzation',
            payload: {
                humanNearMatch: nearMatches,
                humanExactMatch: exactMatches,
                gameId: codeMasterGameId,
                guess: incomingGuess,
                userName: currentUser.userName
            }   
        });
        setReceivedGuess(!receivedGuess);
    };
    
    return (
        <>
        {!receivedGuess && masterCodeCreated ? <p>Waiting on other player to submit guess</p> :
            <div 
                id="create-master-code"
            >
                <label 
                    htmlFor="mastercode-input"
                >
                    Please submit a mastercode of up to 10 digits between 0-7
                </label>
                <input
                    type="number"
                    value={masterCode}
                    placeholder="Master Code Goes Here"
                    onChange={(e) => setMasterCode(e.target.value)}
                    name="mastercode-input"
                >
                </input>
                <button onClick={(e) => handleSubmitMasterCodeButtonClick(e)}>Submit Mastercode</button>
            </div>
        }
        {receivedGuess && masterCodeCreated &&
        <div
            id="analyze-guess-div"
        >
            <p>Mastercode: {masterCode}</p>
            <p>Current Guess: {incomingGuess}</p>
            <p>Attempts Left: {attemptsLeft} </p>
            <label htmlFor="exact-matches-input">Exact matches: </label>
            <input
                name="exact-matches-input"
                type="number"
                placeholder="0-7"
                onChange={(e) => setExactMatches(e.target.value)}
                value={exactMatches}
            ></input>
            <label htmlFor="near-matches-input">Near matches: </label>
            <input
                name="near-matches-input"
                type="number"
                placeholder="0-7"
                onChange={(e) => setNearMatches(e.target.value)}
                value={nearMatches}
            ></input>
            <button onClick={(e) => handleSubmitAnalyzationButtonClick(e)}>Submit Analyzation</button>
            {previousGuesses?.map((previousGuess, i) => (
                <p key={i}>{previousGuess}</p>
            ))}
        </div>}
        {status ? <h3>You {status}!!</h3> : null}
        </>
    )
};

export default CodeMaster;