import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLoginUserMutation, useCreateUserMutation } from "../../../store/loginRTKQuery";
import { setUser } from "../../../store/slices/sessionSlice";
import './index.scss';

const LogIn = () => {
    const [userName, setUsername] = useState('');
    const [password, setPassword ] = useState('');
    const [errors, setErrors] = useState('');
    const [login, {isLoading}] = useLoginUserMutation();
    const [createUser] = useCreateUserMutation();
    const dispatch = useDispatch();

    const handleLoginClick = async (event) => {
        event.preventDefault();
        if (!password.length || !userName.length) {
            setErrors('Username or Password field is empty');
        };
        const { data } = await login({userName, password});
        dispatch(setUser(data));
    };

    const handleCreateNewUserClick = async (event) => {
        event.preventDefault();
        if (!password.length || !userName.length) {
            setErrors('Username or Password field is empty');
            console.log(errors);
        };
        const {data} = await createUser({userName, password});
        console.log({data});
        dispatch(setUser(data));
    };

    return (
        <>
        <div className="login-form">
            <input type="test" value={userName} placeholder="username" onChange={(e) => setUsername(e.target.value)}></input>
            <input type="password" value={password} placeholder="password" onChange={(e)=>setPassword(e.target.value)}></input>
            <button onClick={(e) => handleLoginClick(e)} className="submit-button" type="submit">Login</button>
            <button type="submit" className="submit-button" onClick={(e) => handleCreateNewUserClick(e)}>Create New User</button>
        </div>
            {errors ? <p className="errors">{errors} </p> : null}
        </>
    )
};

export default LogIn;