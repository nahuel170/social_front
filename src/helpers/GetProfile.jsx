import { Global } from './Global';

export const getProfile = async (userId, setState) => {
    try {
    const request = await fetch(Global.url + "user/getUser/" + userId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token")
        }
    });
    const data = await request.json();

   
    return data;
} catch (error) {
    console.error('Error en getProfile:', error);
    throw error;
  }
}