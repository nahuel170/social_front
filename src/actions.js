// actions.js
// Aquí definimos los "action types" como constantes, para evitar typos:
export const SET_PUBLICATIONS = "SET_PUBLICATIONS";
export const USER_FOLLOWED = 'USER_FOLLOWED';
export const USER_UNFOLLOWED = 'USER_UNFOLLOWED';
export const LIKE_PUBLICATION = "LIKE_PUBLICATION";
export const UNLIKE_PUBLICATION = "UNLIKE_PUBLICATION";
export const SET_COUNTERS = 'SET_COUNTERS';

// Action creator para setPublications
export const setPublications = (publications) => ({
  type: 'SET_PUBLICATIONS',
  payload: publications,
});
// Action creator para setCounters
export const setCounters = (followersCount, followingCount, publicationsCount, likesTotal) => ({
  type: SET_COUNTERS,
  payload: {
    followersCount,
    followingCount,
    publicationsCount,
    likesTotal,
  },
});

// Action creator para follow
export const followedUser = (followedId) => ({
  type: 'USER_FOLLOWED',
  payload: { followedId },
});

// Action creator para unFollow
export const userUnfollowed = (unfollowedId) => ({
  type: 'USER_UNFOLLOWED',
  payload: { unfollowedId },
});

// Action creator para dar "like"
export const likePublication = (publicationId, userId) => ({
  type: 'LIKE_PUBLICATION',
  payload: { publicationId, userId },
});

// Action creator para quitar "like"
export const unlikePublication = (publicationId, userId) => ({
  type: 'UNLIKE_PUBLICATION',
  payload: { publicationId, userId },
});