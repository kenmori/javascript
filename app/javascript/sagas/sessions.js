import { all, call, takeLatest } from 'redux-saga/effects';
import API from '../utils/api';
import actionTypes from '../constants/actionTypes';
import history from '../utils/history';

function* signIn({ payload }) {
  yield call(API.post, '/users/sign_in', { user: payload.params });
  location.href = '/';
}

function* signOut() {
  yield call(API.delete, '/users/sign_out');
  location.href = '/users/sign_in';
}

export function *sessionSagas() {
  yield all([
    takeLatest(actionTypes.SIGN_IN, signIn),
    takeLatest(actionTypes.SIGN_OUT, signOut),
  ]);
}