import { useEffect } from 'react';
import axios from 'axios';
import logger from './utils/logger';

const Layout = ({ children }) => {
  useEffect(() => {
    // Only check in development
    if (process.env.NODE_ENV === 'development') {
      const testConnection = async () => {
        try {
          const response = await axios.get('/api/health');
          logger.log('Backend connection OK:', response.data);
        } catch (error) {
          logger.error('Backend connection failed:', error);
        }
      };

      testConnection();
    }
  }, []);

  return <div className="layout">{children}</div>;
};

export default Layout;
