class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :timeoutable and :omniauthable
  devise :database_authenticatable, :recoverable, :rememberable, :trackable, :validatable, :confirmable, :lockable

  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email, presence: true, uniqueness: true, format: { with: VALID_EMAIL_REGEX }
  validates :first_name, presence: true, length: { maximum: 255 }
  validates :last_name, presence: true, length: { maximum: 255 }

  has_many :group_members, dependent: :destroy
  has_many :groups, through: :group_members
  has_many :objective_members, dependent: :destroy
  has_many :objectives, through: :objective_members
  has_many :key_result_members, dependent: :destroy
  has_many :key_results, through: :key_result_members
  has_many :unprocessed_key_results, -> { where(key_result_members: { processed: false }) }, through: :key_result_members, :source => :key_result 
  has_many :comments # destroy 時に何もしない
  has_many :organization_members, dependent: :destroy
  has_many :organizations, through: :organization_members
  has_many :objective_orders, dependent: :destroy

  mount_uploader :avatar, AvatarUploader

  attr_accessor :no_password_required

  def organization
    current_organization_id.present? ? organizations.find(current_organization_id) : organizations.first
  end

  def password_required?
    super if need_confirmed?
  end

  def need_confirmed?
    !no_password_required
  end

  def active_for_authentication?
    super && !disabled
  end

  def inactive_message
    :deleted_account
  end

  # Override devise notification method
  # def send_devise_notification(notification, *args)
  #   devise_mailer.send(notification, self, *args).deliver_later
  # end

end
