// export const Global ={
//     url: "http://localhost:3000/"
// }
// src/helpers/Global.js
export const Global = {
  url: import.meta.env.VITE_API_URL || '/'  
  // en dev VITE_API_URL = 'http://localhost:3000/'
  // en prod VITE_API_URL = '/'
};