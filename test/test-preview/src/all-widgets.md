## All widgets


```widget
{ "name" : "carousel.jade",
  "properties" : {
    "id" : "id-carousel1",
    "images" : [
      { "alt": "alt",
        "src":"/images/carousel.jpg",
        "call2action" : {
                  "title" : "title",
                  "text"  : "klmdkfmdksfmksdmfkdmskmfksmdl",
                  "link"  : {
                    "href" : "/",
                    "anchor" : "anchor »"
                  }
        }
      },
      { "alt": "alt",
        "src":"/images/carousel.jpg"
      },
      { "alt": "alt",
        "src":"/images/carousel.jpg"
      }
    ]
  }

}
```

***


```widget
{ "name" : "alert.jade",
   "properties" : {
      "text"  : "alert message text"
   }
}
```

```widget
{ "name" : "boxes.jade",
  "properties" : {
    "boxes" : [
      {
        "title" : "Title 1",
        "text"  : "Text 1",
        "link"  : {"href" : "/url.html", "anchor" : "anchor »"}
      },
      {
        "title" : "Title 2",
        "text"  : "Text 2",
        "link"  : {"href" : "/url.html", "anchor" : "anchor »"}
      },
      {
        "title" : "Title 3",
        "text"  : "Text 3",
        "link"  : {"href" : "/url.html", "anchor" : "anchor »"}
      }
    ]
  }
}
```
---
Reponsive HTML 5 video

```widget
{ "name" : "video.jade",
  "properties" : {
    "src"      : "/video/big_buck_bunny.mp4",
    "type"     : "video/mp4",
    "width"    : "640",
    "height"   : "480",
    "controls" : true,
    "autoplay" : false,
    "message"  : "Your browser does not support the video tag."
  }
}
```

---
This is a small text

```widget
{ "name" : "call2action-large.jade",
  "properties" : {
    "title" : "Title",
    "text"  : "Call to action large",
    "link"  : {"href" : "/url.html", "anchor" : "anchor »"}
  }
}
```

```widget
{ "name" : "call2action.jade",
  "properties" : {
    "text" : "Call 2 action text",
    "link" : {
      "href" :"/url.html",
      "anchor" : "anchor »"
    }
  }
}
```

```widget
{
  "name" : "image-text-shadow.jade",
  "properties" : {
    "title" : "title",
    "image" : {
        "src" : "/images/200x200-image.jpg",
        "alt" : "alt-text"
     },
     "texts" : [
        "paragraph-1",
        "paragraph-2"
     ]
  }
}
```
```widget
{ "name" : "image-text.jade",
  "properties" : {
    "title" : "Title",
    "texts" : [
          "Paragraph",
          "Paragraph"
    ],
    "image" : {
      "align" : "right",
      "src" : "/images/200x200-image.jpg",
      "alt" : "Alt-text"
    }

  }
}
```

```widget
{ "name" : "image.jade",
  "properties" : {
    "src" : "/images/200x200-image.jpg",
    "alt" : "alt-text"
  }
}
```

***

```widget
{ "name" : "jumbotron.jade",
  "properties" : {
    "title" : "Title",
    "leads" : ["subtitle-1","subtitle-2"],
    "link"  : {"href" : "url", "anchor" : "anchor text  »"}
  }
}
```

***
```widget
{ "name" : "message.jade",
   "properties" : {
      "text"  : "alert message"
   }
}
```

You can use also a list of element with icons. The list of icon can be found [here](http://getbootstrap.com/components/).

```widget
{ "name" : "list.jade",
  "properties" : {
    "columns" :[
        [{"title" : " This is a nice title", "text" : "This is a nice text.", "class" : "glyphicon glyphicon-user"},
         {"title" : " This is a nice title", "text" : "This is a nice text.", "class" :"glyphicon glyphicon-ok-circle"}],
        [{"title" : " This is a seconde title", "text" : "Welcome to cocoons demo.","class" :"glyphicon glyphicon-question-sign"},
         {"title" : " This is a nice title", "text" : "This is a nice text.", "class" : "glyphicon glyphicon-cloud-download"}]
    ]
  }
}
```

```widget
{ "name" : "youtube.jade",
  "properties" : {
    "name"     : "Add a good name or a title for SEO",
    "description" : "Add keywords in this description",
    "duration" : "S25",
    "regionsAllowed" : "FR BE CH",
    "thumbnail" : "/images/thumbnail.jpg",
    "src" : "//www.youtube.com/embed/6A5EpqqDOdk",
    "allowfullscreen" : true
  }
}
```
