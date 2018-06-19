import PasswordSetPage from '../components/signin/PasswordSetPage'
import { connect } from 'react-redux'
import deviseActions from '../actions/devise'
import dialogActions from '../actions/dialogs'
import queryString from 'query-string'

const mapStateToProps = (state, { location }) => {
  return {
    token: queryString.parse(location.search).confirmation_token,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setPassword(password, confirmationToken) {
      dispatch(deviseActions.setPassword({ password, confirmationToken }))
    },
    error: params => {
      dispatch(dialogActions.openErrorModal(params))
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PasswordSetPage)
