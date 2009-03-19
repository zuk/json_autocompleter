# Install hook code here

here = File.dirname(__FILE__)

puts "JSON.Autocompleter: Copying stylesheets to public/stylesheets..."
FileUtils.copy("#{here}/public/stylesheets/auto_complete.css", "#{RAILS_ROOT}/public/stylesheets/")

puts "JSON.Autocompleter: Copying javascripts to public/javascripts..."
if File.exists?("#{RAILS_ROOT}/public/javascripts/json2.js")
  puts "JSON.Autocompleter: json2.js file already exists... it will not be overwritten."
else
  FileUtils.copy("#{here}/public/javascripts/json2.js", "#{RAILS_ROOT}/public/javascripts/")
end
FileUtils.copy("#{here}/public/javascripts/json_autocomplete.js", "#{RAILS_ROOT}/public/javascripts/")

puts "JSON.Autocompleter: Copying images to public/images..."
FileUtils.copy("#{here}/public/images/pulldown.png", "#{RAILS_ROOT}/public/images/")

