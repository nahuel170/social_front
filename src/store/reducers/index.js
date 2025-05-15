// store/reducers/index.js
import { combineReducers } from 'redux';
import publicationReducer from './publicationReducer';
import userReducer from './userReducer';
import profileReducer from './profileReducer'; 
import topLikesReducer from './topLikesReducer';


export const rootReducer = combineReducers({
  publication: publicationReducer,
  user: userReducer,
  profile: profileReducer,
  topLikes:topLikesReducer,
});