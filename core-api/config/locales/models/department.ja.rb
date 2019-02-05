# frozen_string_literal: true

require_dependency Rails.root.join("config/locales/share/model_names")

department_attrs = {
  display_order: "表示順",
  name: "#{model_names[:department]}名",
  organization: model_names[:organization],
  organization_id: model_names[:organization]
}
department_create_attrs = {
  **department_attrs,
  owner_id: "#{model_names[:department]}責任者",
  parent_department_id: "親#{model_names[:department]}"
}

{
  ja: {
    activerecord: {
      attributes: {
        department: department_attrs
      }
    },
    activemodel: {
      attributes: {
        'department/create': department_create_attrs,
        'department/create_default': department_create_attrs,
        'department/index': {
          organization_id: model_names[:organization],
          ids: "#{model_names[:department]}ID"
        },
        'department/update': {
          id: "部署ID",
          **department_create_attrs
        }
      },
      errors: {
        models: {
          'department/archive': {
            must_not_have_children: "下位部署が存在するのでアーカイブ出来ません",
            members_must_not_belong: "ユーザが所属しているのでアーカイブ出来ません"
          },
          'department/update': {
            attributes: {
              base: {
                already_archived: "アーカイブ済みのため更新できません"
              },
              parent_department_id: {
                must_be_other: "は別の部署にしてください",
                exclusion_self: "に子孫の部署を指定することは出来ません"
              }
            }
          },
          'department/restore': {
            parent_department_must_be_active: "親部署がアーカイブされているためリストアできません"
          }
        }
      }
    }
  }
}