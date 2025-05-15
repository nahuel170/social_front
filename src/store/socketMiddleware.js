 // store/socketMiddleware.js
 import socket from '../socket'; // Importamos la instancia del socket
 import { LIKE_PUBLICATION, UNLIKE_PUBLICATION,USER_UNFOLLOWED,USER_FOLLOWED,SET_PUBLICATIONS } from '../actions';
   // Vincular listeners una sola vez al cargar
   let listenersBound = false;
 export const socketMiddleware = (store) => (next) => (action) => {
     switch (action.type) {
         // Conectarse (si lo deseas manualmente)
         case 'WEBSOCKET_CONNECT':
             if (!socket.connected) {
                 socket.connect();
             }
             break;
 
         // Desconectarse
         case 'WEBSOCKET_DISCONNECT':
             if (socket.connected) {
                 socket.disconnect();
             }
             break;
 
         // Cuando el usuario hace "like" en el front, lo notificamos al server
         case 'LIKE_PUBLICATION':
             // payload: { publicationId, userId }
             socket.emit('likePublication', action.payload);
             break;
         case UNLIKE_PUBLICATION:
             socket.emit('unlikePublication', action.payload);
             break;
         // Cuando el usuario hace "follow"
         case 'USER_FOLLOWED':
             // payload: { followedId }
             socket.emit('userFollow', action.payload);
             break;
         case USER_UNFOLLOWED:
             socket.emit('userUnfollow', action.payload);
             break;
         // ... otros casos si gustas ...
         default:
             break;
     }
 
   
 
     if (!listenersBound) {
         // Escuchar todos los eventos que manda el servidor
         socket.on('publicationCreated', (data) => {
             // data = { publicationId, userId, text, etc. }
             store.dispatch({ type: 'PUBLICATION_CREATED', payload: data });
         });
 
         socket.on('publicationDeleted', (data) => {
             store.dispatch({ type: 'PUBLICATION_DELETED', payload: data });
         });
 
         socket.on('publicationLiked', (data) => {
             // data = { publicationId, userId, ... }
             store.dispatch({ type: 'PUBLICATION_LIKED', payload: data });
         });
 
         socket.on('publicationUnliked', (data) => {
             store.dispatch({ type: 'PUBLICATION_UNLIKED', payload: data });
         });
 
         socket.on('followedUser', (data) => {
             // data = { followerId, followedId }
             // 1) Actualiza el userReducer (si es el user logueado)
             store.dispatch({ type: 'USER_FOLLOWED', payload: data });
             
             // 2) Actualiza el profileReducer
             // Obtenemos el actual userProfile del store
             const state = store.getState();
             const currentProfile = state.profile.userProfile;
             // Si estoy viendo el perfil del "followedId"
             if (currentProfile && currentProfile._id === data.followedId || currentProfile._id === data.followerId) {
               // dispatch la acción "PROFILE_USER_FOLLOWED"
               store.dispatch({ type: 'PROFILE_USER_FOLLOWED', payload: data });
             }
           });
 
           socket.on('userUnfollowed', (data) => {
             // data = { followerId, unfollowedId }
             store.dispatch({ type: 'USER_UNFOLLOWED', payload: data });
           
             const state = store.getState();
             const currentProfile = state.profile.userProfile;
             if (currentProfile && currentProfile._id === data.unfollowedId || currentProfile._id === data.followerId) {
               store.dispatch({ type: 'PROFILE_USER_UNFOLLOWED', payload: data });
             }
           });
           socket.on('topLikesUpdated', (data) => {
            console.log('Evento topLikesUpdated recibido:', data);
            store.dispatch({ type: 'FETCH_TOP_LIKES_SUCCESS', payload: data.topLikes });
          });
      
         listenersBound = true;
     }
 
   
 
     return next(action);
 
 };