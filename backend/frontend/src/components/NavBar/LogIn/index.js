import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLoginUserMutation, useCreateUserMutation } from "../../../store/loginRTKQuery";
import './index.scss';

const LogIn = () => {
    const [userName, setUsername] = useState('');
    const [password, setPassword ] = useState('');
    const [errors, setErrors] = useState('');
    const [ gameStatus, setGameStatus ] = useState();
    const [login, {isLoading}] = useLoginUserMutation();
    const [createUser] = useCreateUserMutation();

    const handleLoginClick = async (event) => {
        event.preventDefault();
        if (!password.length || !userName.length) {
            setErrors('Username or Password field is empty');
        };
        const { message, error } = await login({userName, password});
        if (error) {
            setErrors(error?.data?.message);
            return
        } else if (message) {

        }
    };
    
    const handleCreateNewUserClick = (event) => {
        event.preventDefault();
        if (!password.length || !userName.length) {
            setErrors('Username or Password field is empty');
        };
        createUser({userName, password});
    };

    return (
        <>
        <div className="login-form">
            <input type="test" value={userName} placeholder="username" onChange={(e) => setUsername(e.target.value)}></input>
            <input type="password" value={password} placeholder="password" onChange={(e)=>setPassword(e.target.value)}></input>
            <button onClick={(e) => handleLoginClick(e)} className="submit-button" type="submit">Login</button>
            <button type="submit" className="submit-button" onClick={(e) => handleCreateNewUserClick(e)}>Create New User</button>
        </div>
            {!!errors ? <p className="errors">{errors} </p> : null}
        </>
    )
};

export default LogIn;