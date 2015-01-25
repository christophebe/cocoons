var marked = require('marked');
var widgetRenderer = require('./widget-fs.js');

var log = require('../logger.js').Logger;



/**
 * Renderer that extends the default marked component in order
 * to customize table rendering for Bootstrap & to support widget inclusion
 * into markdown content
 *
 * @param params that will be send to the widget templates
 *
 */
var HTMLRenderer = function(params) {

    this.renderer = new marked.Renderer();
    this.renderer.params = params;

    /**
     * Main method - render a markdow content into HTML
     *
     * @param the markdown content to render
     * @returns the HTML result
     */
    this.renderToHTML = function (markdownContent) {

      return marked(markdownContent, {renderer : this.renderer});
    }

    /**
     * Add bootstrap class for a markdown table
     * See the marked documentation for more details
     */
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

    /**
     * Add support for nofollow link with the following markdown syntax :
     * [ancho](nofollow:url)
     *
     */
    this.renderer.link = function(href, title, text) {

      var relAttribute = "";

      //Check if href contains nofollow prefix
      if (href.indexOf("nofollow:") === 0) {
        log.info("******** Prefix found");
        href = href.substring(9);
        log.info("href : " + href);
        relAttribute = "rel=nofollow";
      }

      if (this.options.sanitize) {
        try {
          var prot = decodeURIComponent(unescape(href))
          .replace(/[^\w:]/g, '')
          .toLowerCase();
        } catch (e) {
          return '';
        }
        if (prot.indexOf('javascript:') === 0) {
          return '';
        }
      }

      var out = '<a ' + relAttribute + ' href="' + href + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += '>' + text + '</a>';
      return out;
    }

    /**
     * Render a code section/tag into widget or usual output for code
     * See the marked documentation for more details
     */
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

    /**
     * Render a widget
     * The code inserted in the markdown content has to be in the json format
     *
     * @param the json code that contains widget params
     * @return the HTML code that match to the widget rendering
     *
     */
    this.renderer.renderWidget = function(widgetCode) {

      try {

        var widget = JSON.parse(widgetCode);

      } catch (e) {
        var errorMessage = "Impossible to parse the json structure for the widget content : " +
                           widgetCode + " - error : " + e
        log.error(errorMessage);
        return errorMessage;

      }

      return widgetRenderer.renderHTML(this.params, widget);
    }

    /**
     * Render a code snippet
     *
     * See the marked documentation for more details
     */
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
