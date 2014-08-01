# Carousel demo
***

```widget
{ "name" : "carousel.jade",
  "properties" : {
    "id" : "carousel-example-generic",
    "images" : [
      {
        "datasrc": "holder.js/1140x500/auto/#777:#555/text:First slide", "alt": "First slide",
        "src":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMTQwIiBoZWlnaHQ9IjUwMCI+PHJlY3Qgd2lkdGg9IjExNDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjNzc3Ii8+PHRleHQgdGV4dC1hbmNob3I9Im1pZGRsZSIgeD0iNTcwIiB5PSIyNTAiIHN0eWxlPSJmaWxsOiM1NTU7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LXNpemU6NzFweDtmb250LWZhbWlseTpBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZjtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj5GaXJzdCBzbGlkZTwvdGV4dD48L3N2Zz4=",
        "call2action" : {
          "title" : "Example headline",
          "text"  : "Note: If you're viewing this page via an URL, the 'next' and 'previous' Glyphicon buttons on the left and right might not load/display properly due to web browser security rules.",
          "link"  : {
            "href" : "/",
            "anchor" : "Sign up today"
          }
        }

      },
      {
        "datasrc" : "holder.js/1140x500/auto/#666:#444/text:Second slide", "al" :"Second slide",
        "src" : "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMTQwIiBoZWlnaHQ9IjUwMCI+PHJlY3Qgd2lkdGg9IjExNDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjNjY2Ii8+PHRleHQgdGV4dC1hbmNob3I9Im1pZGRsZSIgeD0iNTcwIiB5PSIyNTAiIHN0eWxlPSJmaWxsOiM0NDQ7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LXNpemU6NzFweDtmb250LWZhbWlseTpBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZjtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj5TZWNvbmQgc2xpZGU8L3RleHQ+PC9zdmc+"
      },
      {
        "datasrc" : "holder.js/1140x500/auto/#555:#333/text:Third slide", "alt" :"Third slide",
        "src" :"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMTQwIiBoZWlnaHQ9IjUwMCI+PHJlY3Qgd2lkdGg9IjExNDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjNTU1Ii8+PHRleHQgdGV4dC1hbmNob3I9Im1pZGRsZSIgeD0iNTcwIiB5PSIyNTAiIHN0eWxlPSJmaWxsOiMzMzM7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LXNpemU6NzFweDtmb250LWZhbWlseTpBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZjtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj5UaGlyZCBzbGlkZTwvdGV4dD48L3N2Zz4="
      }  
    ]
  }

}  
```
## Widget Code

You can insert de following code into a markdown file to display a slider/carousel.

```javacript

{ "name" : "carousel.jade",
  "properties" : {
    "id" : "slider1",
    "images" : [
      { "alt": "First slidexxxx",
        "src":"/images/carousel/xxx.png"
      },
      { "alt" :"Second slide",
        "src" : "/images/carousel/xxx.jpg"
      },
      { "alt" :"Third slide",
        "src" :"/images/carousel/xxx.jpg"
      }
    ]
  }

}

```
