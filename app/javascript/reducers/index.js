import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form'
import entities from './entities';
import objectives from './objectives';
import keyResults from './keyResults';
import users from './users';
import dialogs from './dialogs';
import loginUser from './loginUser';
import current from './current';
import organizations from './organizations';
import okrPeriods from './okrPeriods';
import signUp from './signUp';
import password from './password';
import loading from './loading';
import toasts from './toasts';
import confirm from './confirm';


const reducers = combineReducers({
  form: formReducer,
  entities,
  objectives,
  keyResults,
  users,
  dialogs,
  loginUser,
  current,
  organizations,
  okrPeriods,
  signUp,
  password,
  loading,
  toasts,
  confirm,
});

export default reducers;
