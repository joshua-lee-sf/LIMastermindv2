import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import CodeBreaker from "./CodeBreaker";
import CodeMaster from "./CodeMaster";
import { useRestoreUserQuery } from "../../../../store/loginRTKQuery";

export const newURIGenerator = () => {
    const loc = window.location
    let newUri = loc.protocol === "https:" ? "wss:" : "ws:"
    newUri += "//" + loc.host;

    return newUri
};

const MultiPlayerGameBoard = () => {
    // const socketUrl = newURIGenerator();
    const socketUrl = 'ws://localhost:5000';
    const [ role, setRole ] = useState('');
    const [ hideGuessSubmit, setHideGuessSubmit ] = useState(true);
    const [ receivedGuess, setReceivedGuess ] = useState(false);
    const [ incomingGuess, setIncomingGuess ] = useState('');
    const [ errors, setErrors ] = useState('')
    const {data: currentUser} = useRestoreUserQuery();
    const [currentGame, setCurrentGame] = useState();
    const [codeMasterGameId, setcodeMasterGameId] = useState();
    const [ previousGuesses, setPreviousGuesses ] = useState();
    const [ attemptsLeft, setAttemptsLeft ] = useState();
    const [ status, setStatus ] = useState('');
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {share: true });

    useEffect((e) => {
        if (!lastJsonMessage) return;

        if (!lastJsonMessage.type || !lastJsonMessage.payload) {
            console.log('Message is not formatted correctly.');
            return;
        };

        const sendUserName = () => {
            sendJsonMessage({
                type: 'sendUserName',
                payload: {
                    userName: currentUser.userName
                }
            });
        };
    
        switch (lastJsonMessage.type) {
            case 'sendRole':
                setRole(lastJsonMessage.payload.role);
                if (lastJsonMessage.payload.guessCheck) setHideGuessSubmit(lastJsonMessage.payload.guessCheck);
                setErrors("");
                break;
            case 'startGame':
                if (!lastJsonMessage.payload.guessCheck) setHideGuessSubmit(lastJsonMessage.payload.guessCheck);
                setCurrentGame(lastJsonMessage.payload.gameId);
                setErrors("");
                break;
            case 'receiveGameId':
                setcodeMasterGameId(lastJsonMessage.payload.gameId);
                setErrors("");
                break;
            case 'receiveGuess':
                setReceivedGuess(lastJsonMessage.payload.receivedGuess);
                setIncomingGuess(lastJsonMessage.payload.guess);
                setErrors("");
                break;
            case 'receiveAnalyzation':
                setPreviousGuesses(lastJsonMessage.payload.previousGuesses);
                setAttemptsLeft(lastJsonMessage.payload.attemptsLeft);
                setHideGuessSubmit(!hideGuessSubmit);
                setErrors("");
                break;
            case 'sendResult':
                setStatus(lastJsonMessage.payload.status);
                setHideGuessSubmit(!hideGuessSubmit);
                setReceivedGuess(!receivedGuess);
                setErrors("");
                break;
            case 'error':
                setErrors(lastJsonMessage.payload.message);
                setReceivedGuess(!receivedGuess);
                setHideGuessSubmit(!hideGuessSubmit);
            default:
                console.log('Default case');
        };
    }, [lastJsonMessage]);   

    if (!lastJsonMessage) return null; 

    return(
        <>
        { role === 'CodeMaster' ? 
            <CodeMaster 
                receivedGuess={receivedGuess} 
                incomingGuess={incomingGuess} 
                codeMasterGameId={codeMasterGameId} 
                attemptsLeft={attemptsLeft} 
                previousGuesses={previousGuesses} 
                setReceivedGuess={setReceivedGuess} 
                status={status}/>:
            <CodeBreaker 
                hideGuessSubmit={hideGuessSubmit}
                setHideGuessSubmit={setHideGuessSubmit} 
                currentGame={currentGame} 
                attemptsLeft={attemptsLeft} 
                previousGuesses={previousGuesses}
                status={status}/> }
            {errors ? <p>{errors}</p> : null};
        </>
    )
};

export default MultiPlayerGameBoard;