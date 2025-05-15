import React, { useContext } from 'react';
import AuthContext from '../../src/context/AuthProvider.jsx';

 const useAuth = () => {
  return  useContext(AuthContext);
   
}

export default useAuth;