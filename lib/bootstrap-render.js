var marked  = require('marked');

var renderer = new marked.Renderer();

renderer.table= function (header, body) {
                    return "<table class='table table-striped table-bordered'>\n"
                      + '<thead>\n'
                      + header
                      + '</thead>\n'
                      + '<tbody>\n'
                      + body
                      + '</tbody>\n'
                      + '</table>\n';


}


renderer.code = function (code, language) {

    console.log(" *** language : " +  language);
    console.log(" *** code  : " +  code);



    if (this.options.highlight) {
      var out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    if (!lang) {
      return '<pre><code>'
        + (escaped ? code : escape(code, true))
        + '\n</code></pre>';
    }

    return '<pre><code class="'
      + this.options.langPrefix
      + escape(lang, true)
      + '">'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>\n';

}



var renderToHTML = function (markdownContent) {

  return marked(markdownContent, {renderer : renderer});
}

module.exports.renderToHTML = renderToHTML;
