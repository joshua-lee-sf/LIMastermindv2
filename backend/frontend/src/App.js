import logo from './logo.svg';
import './App.css';
import React, {useEffect} from 'react';
import Login from './components/LogIn/index.js';

function App() {
  
  return (
    <div className="App">
      <header className="App-header">
        <Login/>
        <h1>Mastermind Game</h1>
      </header>
    </div>
  );
}

export default App;
