import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routing } from './router/Routing';


function App() {
  const dispatch = useDispatch();

    useEffect(() => {
        // Conectar WebSocket al cargar la aplicación
        dispatch({ type: 'WEBSOCKET_CONNECT' });

        // Desconectar WebSocket al desmontar la aplicación
        return () => {
            dispatch({ type: 'WEBSOCKET_DISCONNECT' });
        };
    }, [dispatch]);


  return (
    <div className='layout'>
   <Routing/>
   
    </div>
      )
}

export default App
