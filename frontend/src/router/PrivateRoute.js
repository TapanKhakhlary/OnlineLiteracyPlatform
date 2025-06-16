import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../api/authService';

const PrivateRoute = ({ roles }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();

        // Check if route requires specific roles
        if (roles && !roles.includes(user.role)) {
          navigate('/unauthorized');
        }
      } catch (err) {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, roles]);

  return <Outlet />;
};

export default PrivateRoute;
