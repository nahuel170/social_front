export const SET_PROFILE = 'SET_PROFILE';
export const PROFILE_USER_FOLLOWED = 'PROFILE_USER_FOLLOWED';
export const PROFILE_USER_UNFOLLOWED = 'PROFILE_USER_UNFOLLOWED';

export const setProfile = (user, counters) => ({
  type: SET_PROFILE,
  payload: { user, counters },
});

// Action creator para Follow
export const followedUser = (followedId) => ({
    type: 'PROFILE_USER_FOLLOWED',
    payload: { followedId },
  });

  // Action creator para unFollow
export const userUnfollowed = (unfollowedId) => ({
    type: 'PROFILE_USER_UNFOLLOWED',
    payload: { unfollowedId },
  });
  