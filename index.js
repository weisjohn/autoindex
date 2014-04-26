
// parse an autoindex page into JSON

(function() {

    var root = this, type;

    var apache = {
        wrapper: /<table>(.+)<\/table>/g,
        rows: /<a href=\"(.+)\">(.+)<\/a>.+(\d{2}\-[a-zA-Z]{3}-\d{4}\ \d{2}\:\d{2})\s+(\d{0,5})/g,
        dir: /alt\=\"\[DIR\]\"/,
        parent: /Parent Directory/,
        root: /<h1>Index of \/<\/h1>/,
    }

    var nginx = {
        wrapper: /<pre>(.+)<\/pre>/g,
        rows: /<a href=\"(.+)\">(.+)<\/a>.+(\d{2}\-[a-zA-Z]{3}-\d{4}\ \d{2}\:\d{2})\s+(\d{0,5})/g,
        dir: /href=\"(.*)\/\"/,
        parent: /href="..\/">..\//,
        root: /\<h1\>Index of \/<\/h1>/,
    }

    var types = { apache: apache, nginx: nginx };

    function isDir(str) { return types[type].dir.test(str); }
    function isParent(str) { return types[type].parent.test(str); }
    function isRoot(page) { return types[type].root.test(page); }

    function autoindex(url, opts, cb) {

        // validation / options
        if (typeof url !== "string") return cb('URL must be a string');
        if (!/\/$/.test(url)) url += "/";
        // TODO: what is this next line for? can we nix it?
        // var root = url.match(/^(.*\/\/[^\/?#]*).*$/)[1];
        if (typeof opts === "function") cb = opts, opts = {};


        function parser(opts, cb) {
            return function(page) {
                if (typeof page === "undefined") return cb("No page");

                // detect apache vs nginx
                if (apache.rows.test(page)) {
                    type = "apache";
                } else {
                    type = "nginx";
                }

                var files = [], directories = [], parent;
                page.replace(types[type].rows, function(row, href, name, date, size) {

                    
                    var obj = { href: href, name: name, date: date, size: size };

                    // create the url 
                    obj.url = (url + obj.href).replace(/([^:])\/\//, "$1\/", "g").replace(/&amp;/g, "&");

                    // convert the name property to be clean (no "/" at the end)
                    obj.name = obj.name.replace(/\/$/, "");

                    // change date to modified, delete data
                    if (obj.date) { obj.modified = new Date(obj.date); delete obj.date; }
                    
                    // sort into the correct bin, special shortcut because we're in a .replace()
                    if (!isDir(row)) { files.push(obj); return; }

                    delete obj.size;
                    if (!isParent(row)) { directories.push(obj); return; }
                    parent = obj;
                    
                });

                cb(null, {
                    root: isRoot(page),
                    parent: parent,
                    directories: directories,
                    files: files
                });

            }
        }

        // use jQuery if you can, if not, XHR, or try to node
        if (typeof $ !== "undefined" && !!$().jquery) {
            $.ajax(url).then(parser(opts, cb), function(j, t, e) {
                cb(e);
            });
        } else if (typeof XMLHttpRequest !== "undefined") {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() { if (xhr.response) parser(opts, cb)(xhr.response); }
            xhr.onerror = function(e) { cb(e); }
            xhr.open('get', url, true);
            xhr.send();
        } else if (typeof module !== "undefined" && typeof require !== "undefined") {
            // module exploration based on protocol, reckless
            var mod = url.split('://')[0];
            var protocol = require(mod);
            protocol.get(url, function(res) {
                var response = "";
                res.on('data', function(d) { response += d; });
                res.on('end', function(d) {
                    response += d;
                    if (response) parser(opts, cb)(response);
                });
            }).on('error', cb);
        }
    }

    // shamelessly stolen from https://github.com/caolan/async/blob/master/lib/async.js
    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return autoindex;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        // Node.js
        module.exports = autoindex;
    } else {
        // included directly via <script> tag
        root.autoindex = autoindex;
    }

})();
