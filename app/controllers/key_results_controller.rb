class KeyResultsController < ApplicationController
  def index
    render json: KeyResult
                   .joins({ owner: { user: :organization_member } })
                   .where(organization_members: { organization_id: current_organization.id })
  end

  def create
    forbidden and return unless valid_permission?(Objective.find(params[:key_result][:objective_id]).owner.organization.id)
    forbidden and return unless valid_permission?(Owner.find(params[:key_result][:owner_id]).organization.id)

    ActiveRecord::Base.transaction do
      @key_result = KeyResult.create!(key_result_create_params)
      params[:key_result][:key_result_members].each do |id|
        # FIXME: 任意のユーザIDで作成してしまうが、サーバ側で採番しない？
        @key_result.key_result_members.create!(user_id: id)
      end
    end
    render status: :created
  rescue
    render json: @key_result.errors, status: :unprocessable_entity
  end

  def update
    @key_result = KeyResult.find(params[:id])
    forbidden and return unless valid_permission?(@key_result.objective.owner.organization.id)

    ActiveRecord::Base.transaction do
      @key_result.update!(key_result_update_params)
      update_key_result_members if params[:key_result][:key_result_member]
      update_comment if params[:key_result][:comment]
    end
    render action: :create, status: :ok
  rescue
    unprocessable_entity_with_errors(@key_result.errors)
  end

  def destroy
    @key_result = KeyResult.find(params[:id])
    forbidden and return unless valid_permission?(@key_result.objective.owner.organization.id)

    if @key_result.destroy
      render action: :create, status: :ok
    else
      unprocessable_entity_with_errors(@key_result.errors)
    end
  end

  private

  def update_key_result_members
    key_result_member_data = params[:key_result][:key_result_member]
    if key_result_member_data['behavior'] == 'add'
      # FIXME: 任意のユーザIDで作成してしまうが、サーバ側で採番しない？
      @key_result.key_result_members.create!(user_id: key_result_member_data['data'])
    elsif key_result_member_data['behavior'] == 'remove'
      # FIXME: 任意のユーザIDで作成してしまうが、サーバ側で採番しない？
      person = @key_result.key_result_members.find_by(user_id: key_result_member_data['data'])
      person.destroy!
    end
  end

  def update_comment
    comment_data = params[:key_result][:comment]
    if comment_data['behavior'] == 'add'
      @key_result.comments.create!(text: comment_data['data'], user_id: current_user.id)
    elsif comment_data['behavior'] == 'edit'
      data = comment_data['data']
      comment = @key_result.comments.find(data['id'])
      comment.update!(text: data[:text])
    elsif comment_data['behavior'] == 'remove'
      comment = @key_result.comments.find(comment_data['data'])
      comment.destroy!
    end
  end

  def key_result_create_params
    params.require(:key_result)
      .permit(:name, :objective_id, :owner_id, :target_value, :value_unit, :expired_date)
  end

  def key_result_update_params
    params.require(:key_result)
      .permit(:name, :description, :progress_rate, :target_value, :actual_value, :value_unit, :expired_date, :owner_id)
  end
end