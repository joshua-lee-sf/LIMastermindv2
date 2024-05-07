import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../../store/slices/sessionSlice";
import Cookies from 'js-cookie';

const LogOut = () => {
    const {userName} = useSelector((state) => state.session);
    const dispatch = useDispatch()

    const handleLogOutClick = (event) => {
        event.preventDefault();
        dispatch(logoutUser());
        Cookies.remove('jwt');
    };
    
    return (
        <>
            <h1>Hello {userName}!</h1>
            <button onClick={(e) => (handleLogOutClick(e))}>LogOut</button>
        </>
    )
};

export default LogOut;