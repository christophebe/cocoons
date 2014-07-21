
##Install NodeJS & npm

You must install NodeJS to start with Cocoons.io.

**On Mac with Homebrew**
```
brew install node
```
nmp will be also installed with the previous command

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

create a new directory and initialize the project structure :

```
mkdir my-webiste
cocoons create
```

By default, a Cocoons.io project will contains the following structure :
- **src** : the artifacts of the site : content (html or markdown), images, css, ...
- **target** : the generated site will be in this folder.
- **templates** : the templates used to transform markdown file into HTML.
- **logs** : log file used for the preview mode & during the site generation process.
- There is also a **cocoon.json** file which contains the site parameters.

## Review cocoon.json

##Add your content into the source folder



**Markdown file**


##Run the preview mode

##Generate the site

##Change the templates

##Features that we want to work on

- Generate a site structure from a mindmap
- Create optimal links between pages
- Support 2 modes : file system based or CMS
- plugins like Google analytics, custom widgets, ...
- Hackable engine & content editor

Please, tell us what kind of features you are looking for.
