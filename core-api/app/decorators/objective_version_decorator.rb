# frozen_string_literal: true

module ObjectiveVersionDecorator
  def diffs
    snapshot = reify(dup: true)
    JSON.parse(object_changes).each_with_object([]) do |(k, v), memo|
      diff = {}
      case k
      when "disabled_at"
        # 無効にしたのであれば変更日時ではなく差分メッセージを送る
        diff = {
          column: I18n.t("activerecord.attributes.objective.#{k}"),
          before: v[0] == nil ? '有効' : '無効',
          after: v[1] == nil ? '有効' : '無効',
        }
      when "progress_rate"
        # progress_rateがnilでない場合、子の進捗率を無視して直接進捗率編集したことになる
        # その場合はprogress_rateの値を利用するが、nilであればsub_progress_rateの値を参照する
        diff = {
          column: I18n.t("activerecord.attributes.objective.#{k}"),
          before: v[0] == nil ? "#{snapshot.sub_progress_rate}%" : "#{v[0]}%",
          after: v[1] == nil ? "#{snapshot.sub_progress_rate}%" : "#{v[1]}%",
        }
      when "sub_progress_rate"
        diff = {
          column: I18n.t("activerecord.attributes.objective.#{k}"),
          before: v[0] == nil ? "0%" : "#{v[0]}%",
          after: v[1] == nil ? "0%" : "#{v[1]}%",
        }
      else
        diff = {
          column: I18n.t("activerecord.attributes.objective.#{k}"),
          before: v[0] == nil ? '初期値' : v[0],
          after: v[1] == nil ? '初期値' : v[1],
        }
      end
      memo << diff
    end
  end
end