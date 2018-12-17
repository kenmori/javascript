# frozen_string_literal: true

class DepartmentsController < ApplicationController
  before_action :authorize!
  skip_before_action :verify_authenticity_token, if: :staging?

  def index
    result = Department::Index.call(
      params: {
        organization_id: current_organization.id,
        ids: params[:ids]
      }
    )

    if result.success?
      render json: { departments: result[:query] }, status: :ok
    else
      render_contract_errors(result)
    end
  end

  def create
    result = Department::Create.call(
      params: params["department"].merge(organization_id: current_organization.id)
    )

    if result.success?
      @department = result[:model]
      render status: :created
    else
      render_contract_errors(result)
    end
  end

  def update
    result = Department::Update.call(
      params: params[:department].merge(
        id: params[:id],
        organization_id: current_organization.id
      )
    )

    if result.success?
      @department = result[:model]
      render :create, status: :ok
    else
      render_contract_errors(result)
    end
  end

  def destroy
    result = Department::Archive.call(
      params: { id: params[:id] }
    )

    if result.success?
      head :no_content
    else
      render_contract_errors(result)
    end
  end

  private

    def authorize!
      authorize Department
    end

    def staging?
      Rails.env.stating?
    end
end