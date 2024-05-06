import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLoginUserMutation } from "../../store/loginRTKQuery";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword ] = useState('');
    const [errors, setErrors] = useState('');
    const dispatch = useDispatch();
    const [login, {isLoading}] = useLoginUserMutation();

    const handleLoginClick = async (event) => {
        event.preventDefault();
        if (!password.length || !username.length) {
            setErrors('Username or Password field is empty');
        }
        const user = await login({username, password});

        // dispatch setCredential
        // return token and user to add to state
        
    };

    const handleCreateNewUserClick = (event) => {
        event.preventDefault();
        console.log("hello nerds");
    };
    

    return (
        <>
            <form id="Login Form" onSubmit={(e) => handleLoginClick(e)}>
                <input type="test" value={username} placeholder="username" onChange={(e) => setUsername(e.target.value)}></input>
                <input type="password" value={password} placeholder="password" onChange={(e)=>setPassword(e.target.value)}></input>
                <button type="submit">Login</button>
            </form>
            <button type="submit" onClick={(e) => handleCreateNewUserClick(e)}>Create New User</button>
        </>
    );
};

export default Login;

