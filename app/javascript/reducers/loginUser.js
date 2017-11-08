import { fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import ActionTypes from '../constants/actionTypes';
import gon from '../utils/gon';

const initialState = fromJS({
  id: gon.getIn(['loginUser', 'id']),
  lastName: gon.getIn(['loginUser', 'lastName']),
  firstName: gon.getIn(['loginUser', 'firstName']),
  email: gon.getIn(['loginUser', 'email']),
  avatarPath: gon.get('loginUserAvatarPath'),
});

export default handleActions({
  [ActionTypes.UPDATED_USER]: (state, { payload }) => {
    return payload.user.get('id') === state.get('id') ? payload.user : state;
  },
}, initialState);
