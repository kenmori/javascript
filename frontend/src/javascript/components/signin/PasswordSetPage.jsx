import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Button, Form, Image, Segment, Message } from "semantic-ui-react";
import DocumentTitle from "react-document-title";
import logo_image from "../../images/logo_large.png";
import DefaultLayout from "../templates/DefaultLayout";

class PasswordSetPage extends PureComponent {
  constructor() {
    super();
    this.state = {
      password: "",
      passwordConfirmation: "", // null だとバリデーション対象から外れるため空文字列を指定する
    };
  }

  setPassword = () =>
    this.props.setPassword(
      this.state.password,
      this.state.passwordConfirmation,
      this.props.token,
    );

  render() {
    return (
      <DefaultLayout>
        <DocumentTitle title="パスワード設定 - Resily">
          {this.renderBody()}
        </DocumentTitle>
      </DefaultLayout>
    );
  }

  renderBody() {
    return (
      <div className="sign-in">
        <Image as="h1" src={logo_image} title="Resily" />

        <Message content="アカウントに設定するパスワードを入力してください。" />

        <Segment raised compact padded="very">
          <Form className="sign-in__form">
            <Form.Input
              inline
              label="パスワード"
              type="password"
              name="new-password"
              autoComplete="new-password"
              placeholder="英数字8文字以上"
              icon="lock"
              iconPosition="left"
              onChange={(e, { value }) => this.setState({ password: value })}
            />

            <Form.Input
              inline
              label="パスワード (確認用)"
              type="password"
              placeholder="英数字8文字以上"
              icon="lock"
              iconPosition="left"
              onChange={(e, { value }) =>
                this.setState({ passwordConfirmation: value })
              }
            />
          </Form>
        </Segment>

        <Button
          positive
          className="sign-in__submit"
          content="設定する"
          onClick={this.setPassword}
        />

        <Message className="sign-in__link" size="small">
          <p>
            <a href="/login">トップに戻る</a>
          </p>
        </Message>
      </div>
    );
  }
}

PasswordSetPage.propTypes = {
  // container
  token: PropTypes.object.isRequired,
  setPassword: PropTypes.func.isRequired,
  // component
};

export default PasswordSetPage;