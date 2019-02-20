# frozen_string_literal: true

# ## Schema Information
#
# Table name: `key_results`
#
# ### Columns
#
# Name                     | Type               | Attributes
# ------------------------ | ------------------ | ---------------------------
# **`id`**                 | `bigint(8)`        | `not null, primary key`
# **`actual_value`**       | `float(24)`        |
# **`description`**        | `text(65535)`      |
# **`disabled_at`**        | `datetime`         |
# **`expired_date`**       | `date`             |
# **`name`**               | `string(255)`      | `not null`
# **`progress_rate`**      | `integer`          |
# **`result`**             | `string(255)`      |
# **`status`**             | `integer`          | `default("green"), not null`
# **`sub_progress_rate`**  | `integer`          |
# **`target_value`**       | `float(24)`        |
# **`value_unit`**         | `string(255)`      |
# **`created_at`**         | `datetime`         | `not null`
# **`updated_at`**         | `datetime`         | `not null`
# **`objective_id`**       | `integer`          | `not null`
# **`okr_period_id`**      | `integer`          | `not null`
#

class KeyResult < ApplicationRecord
  has_many :comments, -> { order("created_at DESC") }, dependent: :destroy
  has_many :key_result_members, dependent: :destroy
  has_many :users, through: :key_result_members
  has_many :child_objectives, class_name: "Objective", foreign_key: :parent_key_result_id, dependent: :nullify
  belongs_to :okr_period
  belongs_to :objective, touch: true
  has_paper_trail ignore: %i[updated_at objective_id okr_period_id], versions: {
    class_name: "KeyResultVersion"
  }

  enum status: { green: 0, yellow: 1, red: 2 }

  scope :enabled, -> { where(disabled_at: nil) }
  scope :disabled, -> { where.not(disabled_at: nil) }
  scope :unprocessed, -> { where(key_result_members: { processed: false }) }

  validate :target_value_required_if_value_unit_exists,
           :expired_date_can_be_converted_to_date
  validates :name, :objective_id, :okr_period_id, presence: true
  validates :target_value, numericality: { greater_than_or_equal_to: 0 }, if: :target_value_present?
  validates :actual_value, numericality: { greater_than_or_equal_to: 0 }, if: :actual_value_present?
  validates :progress_rate,
            numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100, only_integer: true },
            allow_nil: true

  after_create :update_progress_rate_on_create
  after_update :update_progress_rate_on_update
  after_update :update_child_disabled_on_update
  after_update :notify_on_update, if: -> { Current.user }
  after_update_commit :notify_on_commit, if: -> { okr_period.organization.slack_access_token.present? && Current.user && previous_changes.present? }

  before_validation do
    self.okr_period_id = objective.okr_period_id
  end

  after_destroy do
    objective&.update_sub_progress_rate # 上位進捗率の連動更新
  end

  def progress_rate
    super || sub_progress_rate || 0
  end

  def target_value=(value)
    value.tr!("０-９．", "0-9.") if value.is_a?(String)
    super(value)
    update_progress_rate
  end

  def actual_value=(value)
    value.tr!("０-９．", "0-9.") if value.is_a?(String)
    super(value)
    update_progress_rate
  end

  def update_progress_rate
    if target_value.present? && actual_value.present? && target_value > 0 && actual_value >= 0
      self.progress_rate = [(actual_value * 100 / target_value).round, 100].min
    end
  end

  def update_sub_progress_rate
    enabled_child_objectives = child_objectives.enabled
    new_sub_progress_rate = enabled_child_objectives.empty? ? nil
        : enabled_child_objectives.reduce(0) { |sum, objective| sum + objective.progress_rate } / enabled_child_objectives.size
    update_column(:sub_progress_rate, new_sub_progress_rate) # 下位進捗率を更新する (updated_at は更新しない)
    if progress_rate_in_database.nil?
      objective&.update_sub_progress_rate # 上位進捗率の連動更新
    end
  end

  def owner
    key_result_members.find_by(role: :owner)&.user
  end

  def members
    key_result_members.includes(:user).where(role: :member).map(&:user)
  end

  delegate :present?, to: :target_value, prefix: true

  delegate :present?, to: :actual_value, prefix: true

  def target_value_required_if_value_unit_exists
    if value_unit.present? && target_value.blank?
      errors.add(:target_value, "を入力してください")
    end
  end

  def expired_date_can_be_converted_to_date
    errors.add(:expired_date, "の値が不正です") if expired_date&.to_date.blank?
  end

  def disabled
    !!disabled_at
  end

  private

    def update_progress_rate_on_create
      # 上位進捗率の連動更新
      objective&.update_sub_progress_rate
    end

    def update_progress_rate_on_update
      # 上位進捗率の連動更新
      objective&.update_sub_progress_rate if saved_change_to_progress_rate?

      # 紐付け変更時は、変更前の上位進捗率も連動更新する
      if saved_change_to_objective_id?
        if objective_id_before_last_save
          Objective.find(objective_id_before_last_save).update_sub_progress_rate
        end
      end
    end

    def update_child_disabled_on_update
      if saved_change_to_disabled_at?
        child_objectives.each do |objective|
          objective.update_attribute(:disabled_at, disabled_at) if disabled != objective.disabled
        end
      end
    end

    def notify_on_update
      if saved_change_to_status?
        NotificationMailer.send_change_kr_status(Current.user, self, status_before_last_save, status)
      end

      if saved_change_to_disabled_at?
        NotificationMailer.change_kr_disabled(Current.user, self, disabled).deliver_later
      end

      if saved_change_to_progress_rate?
        key_result_owner = owner
        objective_owner = objective.owner
        if key_result_owner.id != objective_owner.id && (target_value.present? || actual_value.present?)
          NotificationMailer.update_kr_progress_rate(Current.user, objective_owner, self).deliver_later
        end
      end
    end

    def notify_on_commit
      KeyResultUpdateNotificationJob.perform_later(self, Current.user)
    end
end
