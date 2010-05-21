module JsonAutocompleteHelper
  
  def json_autocomplete(record, association, choices_url, options = {})
    current_id      = record.send("#{association}_id")
    current_name    = record.send(association).to_s
    
    dom_id_base     = options[:dom_id_base]   || dom_id(record)
    dom_name_base   = options[:dom_name_base] || record.class.name.underscore

    dom_id_base     = dom_id_base.gsub(/[\[\]]/,"_")

    base_field_id   = "#{dom_id_base}_#{association}".gsub('__','_')
    base_field_name = "#{dom_name_base}_#{association}"
    
    id_field_name   = "#{dom_name_base}[#{association}_id]"
    type_field_name = "#{dom_name_base}[#{association}_type]"
    ac_field_name   = "#{dom_name_base}[#{association}]" # not used unless preserve_autocomplete_value option is true
    
    js_var_name     = options[:js_var_name] || base_field_id;
    
    width           = options[:width] || "30ex"
    
    as_user_id      = options[:as_user]
    as_user_id      = as_user_id.id if as_user_id && !as_user_id.kind_of?(Integer)
    
    on_change       = options[:onchange] || options[:on_change] || "null"

    label_attribute = options[:label_attribute] || "name"
    
    if as_user_id
      choices_url << (choices_url.include?('?') ? "&" : "?") + "perform_as_user_id=#{as_user_id}"
    end
    
    if options[:with]
      with = "'#{choices_url.include?('?') ? "&" : "?"}' + #{options[:with]}"
    else
      with = "''"
    end
    
    if options[:with_form_elements]
      wfe = ""
      if options[:with_form_elements].kind_of?(Hash)
        wfe << "{"
        options[:with_form_elements].each do |k,e|
          wfe << "'#{k}': $('#{e}'),"
        end
        wfe << "}"
      elsif options[:with_form_elements].kind_of?(Array)
        wfe << "{"
        options[:with_form_elements].each do |e|
          wfe << "$('#{k}').name: $('#{e}'),"
        end
        wfe << "}"
      end
    else
      wfe = 'null'
    end
    with_form_elements = wfe
    
    choices_url = url_for(choices_url) if choices_url.kind_of?(Hash)
    # modify the URL to make sure we're requesting a response in JSON format
    choices_url.sub!(/\?|$/, ".json#{'?' if choices_url.include?('?')}") unless choices_url.include? '.json'
    
    style = options[:style] || ""
    
    if width
      style << "; width: #{width}"
    end

    unless options[:preserve_autocomplete_value]
      ac_field_name = "#{base_field_id}_autocomplete"
    end
    
    type_field = %{<input type="hidden" name="#{type_field_name}" id="#{base_field_id}_type" class="type" />} if options[:include_type_field]
    autocomplete_field = %{<input type="text"   name="#{ac_field_name}" style="width: #{width}" id="#{base_field_id}_autocomplete" class="text" value="#{current_name}" />}

    container = %{
      <div class="auto_complete" id="#{base_field_id}_autocomplete_container" style="#{style}">
        #{autocomplete_field}
        <input type="hidden" name="#{id_field_name}" id="#{base_field_id}_id" class="id" value="#{current_id}" />
        #{type_field}
        <div class="choices_container" id="#{base_field_id}_options"></div>
      </div>
    }

    container = ActionView::Base.field_error_proc.call(container, self) if record.errors && (record.errors.on("#{association}") || record.errors.on("#{association}_id"))
    
    javascript = javascript_tag %{
      window.#{js_var_name} = new JSON.Autocompleter(
        '#{base_field_id}_autocomplete_container', 
        '#{base_field_id}_options', 
        '#{choices_url}',
        {
          'parameters': #{with}, 
          'withFormElements': #{with_form_elements}, 
          'onchange': #{on_change},
          'labelAttribute': '#{label_attribute}',
          'disablePulldown': #{options[:disable_pulldown] || false},
          'indicator': '#{options[:progress_indicator]}'
        }
      )
    }
    
    return container + javascript
  end
  
end