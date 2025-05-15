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
                "Content-Type": "application/jsno",
                "Authorization": token
            }
        });

        const data = await request.json();

        const requestCounters = await fetch(Global.url + "user/counters/" + userId,{
            method: "GET",
            headers: {
                "Content-Type": "application/jsno",
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