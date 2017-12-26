class ApplicationController < ActionController::Base
  respond_to :html, :json

  protect_from_forgery with: :exception

  helper_method :current_organization

  rescue_from ActionController::RoutingError, with: :not_found
  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActionController::InvalidAuthenticityToken, with: :unprocessable_entity

  before_action :authenticate_user!

  protected

  # render 400
  def bad_request(message = '400 error')
    render_with_error(:bad_request, message)
  end

  # render 403
  def forbidden(message = '403 error')
    render_with_error(:forbidden, message)
  end

  # render 404
  def not_found(message = '404 error')
    render_with_error(:not_found, message)
  end

  # render 422
  def unprocessable_entity(message = '422 error')
    render_with_error(:unprocessable_entity, message)
  end

  # render 422 with errors
  def unprocessable_entity_with_errors(errors)
    render_with_errors(:unprocessable_entity, errors)
  end

  # current_organization returns current organization
  def current_organization
    @current_organization ||= current_user.organization
  end

  # valid_permission?? is ACL function.
  # verify client request is valid permission.
  def valid_permission?(organization_id)
    current_organization.id == organization_id&.to_i
  end

  private

  # render_with_error is render json of error.
  def render_with_error(code, message)
    # TODO: structureの定義を見直す
    render json: { error: message }, status: code
  end

  # render_with_errors is render json of ActiveModel::Errors.
  def render_with_errors(code, errors)
    # TODO: クライアントとどうエラーのやり取りを行うか考える
    # errors.messageを展開するだけであれば展開した文字列を引数として
    # 直接renderせずにrender_with_errorを呼び出す方式に変える
    render json: errors, status: code
  end
end