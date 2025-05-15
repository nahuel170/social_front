import { FETCH_TOP_LIKES_SUCCESS } from '../../topLikesActions';

const initialState = [];

const topLikesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TOP_LIKES_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

export default topLikesReducer;