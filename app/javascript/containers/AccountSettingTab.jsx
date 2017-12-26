import AccountSettingTab from '../components/AccountSettingTab';
import { connect } from 'react-redux';
import userActions from '../actions/users';
import sessionActions from '../actions/sessions';
import dialogActions from '../actions/dialogs';

const mapStateToProps = (state) => {
  return {
    user: state.loginUser,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateUser: user => {
      dispatch(userActions.updateUser(user));
    },
    updateEmail: user => {
      dispatch(userActions.updateEmail(user));
    },
    updatePassword: user => {
      dispatch(userActions.updatePassword(user));
    },
    openAvatarImageModal: (targetId, imageData) => {
      dispatch(dialogActions.openAvatarImageModal(targetId, imageData));
    },
    deleteAvatar: user => {
      dispatch(userActions.updateAvatar(user));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountSettingTab);