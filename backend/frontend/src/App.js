import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from 'react';
import Cookies from 'js-cookie';
import { useRestoreUserQuery, useRestoreGameQuery } from './store/loginRTKQuery.js';
import NavBar from './components/NavBar/index.js';
import StartGame from './components/Game/StartGame/index.js';
import SinglePlayerBoard from './components/Game/GameBoard/SinglePlayerBoard/index.js';

function App() {
  const { data: currentUser } = useRestoreUserQuery();
  const { data: currentGame }  = useRestoreGameQuery();

  const userName = currentUser?.userName;
  
  return (
    <div className="App">
      <header className="App-header">
        <NavBar/>
        {!userName && !currentGame ? <h2>Please Log In to Start a game</h2> : null}
        {userName && !currentGame ? <StartGame/> : null}
        {userName && currentGame ? <SinglePlayerBoard/> : null}
      </header>
    </div>
  );
};

export default App;
