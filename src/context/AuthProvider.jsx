// import React, { createContext, useState, useEffect } from 'react';
// import { Global } from '../helpers/Global';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   // 1) Inicializamos `auth` leyendo de localStorage (si existe), o con un objeto vacío.
//   //    De este modo, al recargar la página, `auth` ya contiene al usuario logueado.
//   const [auth, setAuth] = useState(() => {
//     const stored = localStorage.getItem('user');
//     return stored ? JSON.parse(stored) : {};
//   });
//   const [counters, setCounters] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     authUser();
//   }, []);

//   const authUser = async () => {
//     const token = localStorage.getItem('token');
//     const user = localStorage.getItem('user');

//     // 2) Si no hay token o user en localStorage, salimos cargando.
//     if (!token || !user) {
//       setLoading(false);
//       return;
//     }

//     // 3) Parseamos el user y extraemos el _id (no `id`, que estaba dando undefined).
//     const userObj = JSON.parse(user);
//     const userId = userObj._id;

//     // 4) Hacemos la petición al backend para refrescar datos de usuario.
//     const reqUser = await fetch(`${Global.url}user/getUser/${userId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',   // corregido typo: antes tenías "application/jsno"
//         'Authorization': token
//       }
//     });
//     const dataUser = await reqUser.json();

//     // 5) Petición de contadores
//     const reqCounters = await fetch(`${Global.url}user/counters/${userId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': token
//       }
//     });
//     const dataCounters = await reqCounters.json();

//     // 6) Guardamos en el estado tanto el usuario como los contadores.
//     //    Ojo: si tu endpoint devuelve `data.user`, cámbialo aquí.
//     setAuth(dataUser.usuario || dataUser.user);
//     setCounters(dataCounters);
//     setLoading(false);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         auth,
//         setAuth,
//         counters,
//         loading,
//         setCounters
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;
import React, { createContext, useState, useEffect } from 'react';
import { Global } from '../helpers/Global';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState({});
    const [counters, setCounters] = useState({});
    const [loading, setLoading] = useState(true);
    useEffect(() =>{
            authUser();
    },[]);

    const authUser = async ()=>{
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if(!token || !user ){
            setLoading(false);
            return false;
        };

        const userObj = JSON.parse(user);
        const userId = userObj.id;

        const request = await fetch(Global.url + "user/getUser/" + userId,{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const data = await request.json();

        const requestCounters = await fetch(Global.url + "user/counters/" + userId,{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        });

        const dataCounters = await requestCounters.json();

        setAuth(data.usuario);
        setCounters(dataCounters);
        setLoading(false);
    }

    return (<AuthContext.Provider
        value={{
            auth,
            setAuth,
            counters,
            loading,
            setCounters
        }}
    >
        {children}
    </AuthContext.Provider>

    )
}
export default AuthContext;