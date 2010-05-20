# adds the json_autocomplete method to the ActionView FormBuilder
class ActionView::Helpers::FormBuilder
  def json_autocomplete(association, choices_url, options = {})
    options[:dom_id_base] = @object_name
    options[:dom_name_base] = @object_name
    @template.json_autocomplete(@object, association, choices_url, objectify_options(options))
  end
end