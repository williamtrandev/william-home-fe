
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to app since we're using a single page app approach
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
