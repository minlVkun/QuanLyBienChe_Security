import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Đang tải...</div>;
    
    return user ? children : <Navigate id="login" to="/login" />;
};

export default PrivateRoute;