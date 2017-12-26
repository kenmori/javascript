import { fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import ActionTypes from '../constants/actionTypes';
import gon from '../utils/gon';

const initialState = fromJS({
  id: gon.getIn(['loginUser', 'id']),
  lastName: gon.getIn(['loginUser', 'lastName']),
  firstName: gon.getIn(['loginUser', 'firstName']),
  email: gon.getIn(['loginUser', 'email']),
  avatarUrl: gon.get('loginUserAvatarUrl'),
  ownerId: gon.getIn(['loginUser', 'ownerId']),
});

export default handleActions({
  [ActionTypes.UPDATED_USER]: (state, { payload }) => (
    state.get('id') === payload.user.get('id') ? state.merge(payload.user) : state
  ),
  [ActionTypes.UPDATED_AVATAR]: (state, { payload }) => (
    state.get('id') === payload.user.get('id') ? state.merge(payload.user) : state
  ),
}, initialState);