// import React from 'react';
// import { Header } from './Header';
// import { Navigate, Outlet, useLocation } from 'react-router-dom';
// import { Sidebar } from './Sidebar';
// import useAuth from '../../../hooks/useAuth';
// import '../../../assets/css/PrivateLayout.css';

// export const PrivateLayout = () => {
//     const { auth, loading } = useAuth();
//     const location = useLocation();

//     // Verificar si estamos en el perfil del usuario logueado
//     const isProfilePage = location.pathname === `/social/perfil/${auth._id}`;

//     if (loading) {
//         return <h1>Cargando...</h1>;
//     } else {
//         return (
//             <>
//                 <Header />

//                 <div className={`private-layout ${isProfilePage ? 'with-sidebar' : 'no-sidebar'}`}>
//                     {isProfilePage && <Sidebar />}
                    
//                     <section className="layout__content">
//                         {auth._id ? <Outlet /> : <Navigate to="/login" />}
//                     </section>
//                 </div>
//             </>
//         );
//     }
// };
import React from 'react'
import { Header } from './Header'
import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar';
import useAuth from '../../../hooks/useAuth';





export const PrivateLayout = () => {
    const { auth, loading } = useAuth();
  


    if(loading){
        return <h1>Cargando...</h1>
    }else{
    return (
        <>
            <Header />

            <section className="layout__content">
                {auth._id ?
                    <Outlet />
                    :
                    <Navigate to="/login" />
                }
            </section>
            <Sidebar />
           
       
        </>
    )
}
}