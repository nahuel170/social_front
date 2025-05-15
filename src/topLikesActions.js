// src/actions/topLikesActions.js
import { Global } from '../src/helpers/Global';

export const FETCH_TOP_LIKES_SUCCESS = 'FETCH_TOP_LIKES_SUCCESS';

export const fetchTopLikesSuccess = (topLikes) => ({
  type: FETCH_TOP_LIKES_SUCCESS,
  payload: topLikes,
});

export const fetchTopLikes = () => {
  return async (dispatch) => {
    try {
      const response = await fetch(`${Global.url}user/top-likes`, {
        headers: {
          'Authorization': localStorage.getItem("token"),
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        dispatch(fetchTopLikesSuccess(data.users));
      }
    } catch (error) {
      console.error("Error fetching top users:", error);
    }
  };
};