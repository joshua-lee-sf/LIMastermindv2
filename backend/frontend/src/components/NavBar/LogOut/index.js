import Cookies from 'js-cookie';
import './index.scss';
import { useRestoreUserQuery } from "../../../store/loginRTKQuery";

const LogOut = () => {
    const {data: currentUser } = useRestoreUserQuery();

    const handleLogOutClick = (event) => {
        event.preventDefault();
        Cookies.remove('jwt');
    };
    
    return (
        <>
            <h1 id="welcome-message">Hello {currentUser?.userName}!</h1>
            <button id="logout-button" onClick={(e) => (handleLogOutClick(e))}>LogOut</button>
        </>
    )
};

export default LogOut;