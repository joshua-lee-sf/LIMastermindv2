import logo from './logo.svg';
import './App.css';
import React, {useEffect} from 'react';
import Cookies from 'js-cookie';
import NavBar from './components/NavBar/index.js';
import { useDispatch } from 'react-redux';
import { useRestoreUserMutation } from './store/loginRTKQuery.js';
import { setUser } from './store/slices/sessionSlice.js';

function App() {
  const [restoreUser, {isLoading} ] = useRestoreUserMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    restoreUser().then(({data}) => {
      dispatch(setUser(data))
    } );
  }, []);
  
  return (
    <div className="App">
      <header className="App-header">
        <NavBar/>
      </header>
    </div>
  );
}

export default App;
