var marked = require('marked');
var widgetRenderer = require('./widget-fs.js');

var log = require('./logger.js').Logger;

var HTMLRenderer = function(params) {

    this.renderer = new marked.Renderer();
    this.renderer.params = params;

    this.renderToHTML = function (markdownContent) {

      return marked(markdownContent, {renderer : this.renderer});
    }

    this.renderer.table= function (header, body) {
                        return "<table class='table table-striped table-bordered'>\n"
                          + '<thead>\n'
                          + header
                          + '</thead>\n'
                          + '<tbody>\n'
                          + body
                          + '</tbody>\n'
                          + '</table>\n';


    }


    this.renderer.code = function (code, lang, escaped) {

        escaped = true;

        if (lang && lang =="widget") {
            log.debug(code);
            return this.renderWidget(code);
        }
        else {
            return this.renderCode(code,lang,escaped);
        }

    }

    this.renderer.renderWidget = function(widgetCode) {

      try {

        var widget = JSON.parse(widgetCode);

      } catch (e) {
        var errorMessage = "Impossible to parse the json structure for the widget content : " +
                           widgetCode + " - error : " + e
        log.error(errorMessage);
        return errorMessage;

      }

      log.debug("Render widget content : " +widget.name);


      return widgetRenderer.renderHTML(this.params, widget);
    }

    this.renderer.renderCode = function(code,lang,escaped) {
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

    return this;
}

module.exports.HTMLRenderer = HTMLRenderer;
