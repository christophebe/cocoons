
This is a sample page. This HTML page is generated from a markdown file named 'markdown.md'.
The page properties are defined in another file called markdown.json. In this property file you can add all properties you want.
They will be accessible from the templates used to generate the HTML code.



If you need more info on markdown format, please visit this [page](https://github.com/adam-p/markdown-here/wiki/Markdown-Here-Cheatsheet).

## Heading
### H3
#### H4

## Emphasis

Emphasis, aka italics, with *asterisks* or _underscores_.

Strong emphasis, aka bold, with **asterisks** or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~

## Lists

1. First ordered list item
2. Another item
  * Unordered sub-list.
3. Actual numbers don't matter, just that it's a number
   - item 1
   - item 2
4. And another item.

## Images

![alt text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png "Logo Title Text 1")

## Links

[I'm an inline-style link](https://www.google.com)

[I'm an inline-style link with title](https://www.google.com "Google's Homepage")


Or a simple link like http://www.google.com

## Code

```javascript
var s = "JavaScript syntax highlighting";
alert(s);
```

```python
s = "Python syntax highlighting"
print s
```


No language indicated, so no syntax highlighting.
But let's throw in a <b>tag</b>.

## Widget


```widget
{ "name" : "call2action.jade",
  "properties" : {
    "text" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed diam eget risus varius blandit sit amet non magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean lacinia bibendum nulla sed consectetur.",
    "link" : {
      "href" :"/",
      "anchor" : "More info »"
    }
  }
}
```


## Tables

Colons can be used to align columns.

| Tables        | Are           | Cool  |
| ------------- |:--------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

The outer pipes (|) are optional, and you don't need to make the raw Markdown line up prettily. You can also use inline Markdown.

Markdown | Less | Pretty
--- | --- | ---
*Still* | `renders` | **nicely**
1 | 2 | 3

## Blockquotes

> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote.

## Horizontal Rule

---

***

## HTML 5 video player

```widget
{ "name" : "video.jade",
  "properties" : {
    "name"     : "Add a good name or a title for SEO",
    "description" : "Add keywords in this description",
    "duration" : "S25",
    "thumbnail" : "/images/thumbnail.jpg",
    "regionsAllowed" : "FR BE CH",
    "src"      : "/video/big_buck_bunny.mp4",
    "type"     : "video/mp4",
    "width"    : "640",
    "height"   : "480",
    "controls" : false,
    "autoplay" : true,
    "message"  : "Your browser does not support the video tag."
  }
}
```


## Youtube videos

A link to a youtube video :

<a href="http://www.youtube.com/watch?feature=player_embedded&v=6A5EpqqDOdk
" target="_blank"><img src="http://img.youtube.com/vi/6A5EpqqDOdk/0.jpg"
alt="Markdown Tutorial" width="640" height="360" border="10" /></a>


or the iframe youtube code :

<iframe width="640" height="360" src="//www.youtube.com/embed/6A5EpqqDOdk" frameborder="0" allowfullscreen></iframe>
