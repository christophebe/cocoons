
##Install NodeJS & npm

You must install NodeJS to start with Cocoons.io.

**On Mac with Homebrew**
```
brew install node
```
nmp will be also installed with the previous command.

**On Ubuntu**

```
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
```

**Others alternatives**

Others ways to install node.js can be found here : http://nodejs.org/download/.
Don't forget to install npm : https://www.npmjs.org/

##Install cocoons.io

```
npm install cocoons.io -g
```

## Create a new web site

Create a new directory and initialize the project structure :

```
mkdir my-webiste
cd my-website
cocoons create
```

By default, a Cocoons.io project will have the following directories & files :
- **src** : the artifacts of the site : content (html or markdown), images, css, ...
- **target** : the generated site will be in this folder.
- **templates** : the templates used to transform markdown file into HTML.
- **logs** : log files used for the preview mode & during the site generation process.
- There is also a **cocoons.json** file which contains the site parameters.

## Review cocoons.json

On each project root folder, you have to add a cocoons.json file. This file is added with the command **'cocoons create'**.
It contains information on the project and other technical parameters.

This json object is also passed to the template engine. You are free to add more parameters or remove some of them that will not be used by in the templates.

##Add your content into the source folder

The web site content is in the **src** folder.

** The usual web content**

You can add all kind of content you want (HTML, pdf, images, ...). You can also create subdirectories inside the **src** folder.
In this case, the url matches to the different directories (if defined) & the name of the file.

**Markdown file**

You can also add markdown file which is very simple to use for a content oriented web site.
In this case, you have to create 2 differents files :
- a .md file which match to the name of the page.
- a .json file which contains the SEO meta infos & other properties. This file will passed to the template engine.

If you create your website with the command **"cocoons create"**, see the files : sample-page.md & sample-page.json.

In the preview mode (see below) and after generating the web site, you can access to this page with the url : sample-page.html.

If you need more info on markdown format, please visit this [page](https://github.com/adam-p/markdown-here/wiki/Markdown-Here-Cheatsheet).

## Templates

By default, Cocoons.io is using [Jade](http://jade-lang.com/) and [Bootstrap](http://getbootstrap.com/) for the templates.
This is mainly used to transform markdown content into HTML. The templates are located in the folder **templates**.

You can use any kind of template engine that is supported by [Express](http://expressjs.com/).
In this case, you have to change the property **templateEngine** into the file cocoons.json (in theory, not yet tested ;-) )

##Run the preview mode

The preview mode is usefull when you have many changes to do (templates, content, ...) before generating the complete web site.

You can start the preview mode with the following command line :
```
cocoons preview
```

Now, from your browser, you can access to the site with the url :
```
http://localhost:8080
```

You can change the port number in the cocoons.json file.

##Generate the site

You can generate the complete web site with the command line :

```
cocoons generate
```

##Features that we want to work on

- Generate a site structure from a mindmap.
- Create optimal links between pages.
- Support 2 modes : static web site generator or CMS.
- plugins like Google analytics, custom widgets, ...
- Hackable engine & content editor based on [atom.io](http://www.atom.io).
- Application integration.


Please, tell us what kind of features you are looking for.
