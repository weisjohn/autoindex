# autoindex

parse an autoindex page into JSON (client or server-side)

Ever wanted to take an [autoindex page](http://i.johnweis.com/gifs/ "Something like this") use that data programmatically? Now you can.


### example:

```
autoindex('http://i.johnweis.com/gifs/', function(err, results) {
    console.log(results);
})
```

output: 

```
root false
parent { href: '/',
  url: 'http://i.johnweis.com//',
  name: 'Parent Directory',
  type: 'dir' }
directories [ { href: 'sample/',
    url: 'http://i.johnweis.com/sample/',
    name: 'sample/',
    type: 'dir',
    modified: Thu Jan 09 2014 22:24:00 GMT-0500 (EST) } ]
files [ { href: 'balance.gif',
    url: 'http://i.johnweis.com/gifs/balance.gif',
    name: 'balance.gif',
    type: 'img',
    modified: Thu Jan 09 2014 22:17:00 GMT-0500 (EST),
    size: '1.0M' },
  { href: 'lemon.gif',
    url: 'http://i.johnweis.com/gifs/lemon.gif',
    name: 'lemon.gif',
    type: 'img',
    modified: Thu Jan 09 2014 22:16:00 GMT-0500 (EST),
    size: '1.1M' },
  { href: 'yes.gif',
    url: 'http://i.johnweis.com/gifs/yes.gif',
    name: 'yes.gif',
    type: 'img',
    modified: Thu Jan 09 2014 22:16:00 GMT-0500 (EST),
    size: '473K' } ]
```


### server-side 

`npm install autoindex` then: 

```
var autoindex = require('autoindex');
```


### client-side 

autoindex works with or without jQuery. If you need legacy browser support, make sure to add jQuery to your page. To use autoindex, simply add it to your page via a &lt;script&gt; tag or use RequireJS.

**NOTE**: If you wish to use this in the browser, you must [enable CORS](http://enable-cors.org) on that site.


### do no evil

If you're going to use this to write webcrawlers, rate-limit yourself.

