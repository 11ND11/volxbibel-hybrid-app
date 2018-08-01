http_path = "../"
css_dir = "../"
sass_dir = "/"
fonts_dir = "fonts"
images_dir = "images/"
javascripts_dir = "js"

### first step: compile css file ###
sass_options = {:unix_newlines => true}
sourcemap = true
line_comments = false
output_style = :compact


### second step: set prefixes to styles of compiled css file ###
# browser support config: # https://github.com/ai/browserslist

Encoding.default_external = 'utf-8'

require 'autoprefixer-rails'

on_stylesheet_saved do |file|
    css = File.read(file)
    map = file + '.map'

    if File.exists? map
        result = AutoprefixerRails.process(
            css,
            from: file,
            to:   file,
            map:  { prev: File.read(map), inline: false },
            browsers: ['last 2 versions', '> 5%', 'ie > 8']
        )
        File.open(file, 'w') { |io| io << result.css }
        File.open(map,  'w') { |io| io << result.map }
    else
        File.open(file, 'w') { |io| io << AutoprefixerRails.process(
            css,
            browsers: ['last 2 versions', '> 5%', 'ie > 8']
        )}
    end
end