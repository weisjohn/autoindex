
// parse an autoindex page into JSON

(function() {

    var root = this;

    function isDir(str) { return /alt\=\"\[DIR\]\"/.test(str); }
    function isParent(str) { return /Parent Directory/.test(str); }

    function autoindex(url, opts, cb) {

        // validation / options
        if (typeof url !== "string") return cb('URL must be a string');
        var root = url.match(/^(.*\/\/[^\/?#]*).*$/)[1];
        if (typeof opts === "function") cb = opts, opts = {};

        // grab info out of a line
        function objectify(str, should_console) {

            var obj = {};
            // find the href of the file
            obj.href = str.match(/href\=\"([^\"]*)\"/m)[1];
            obj.url = (url + obj.href).replace(/([^:])\/\//, "$1\/", "g").replace(/&amp;/g, "&");

            // find the file name (preserve truncation)
            obj.name = str.match(/<a href\=\"(?:[^\"]*)\">(.+)<\/a>/)[1];
            obj.type = str.match(/alt\=\"\[(.*)\]\"/)[1].toLowerCase();
            
            // parent directory don't have a modified time
            if (!isParent(str)) obj.modified = str.match(/\>(\d{2}-\w*-\d{4} \d{2}\:\d{2})/)[1];
            if (obj.modified) obj.modified = new Date(obj.modified);

            // directories don't have size
            if (!isDir(str)) obj.size = str.match(/\>( *\d*\.*\d*[BKMGT])\</)[1].trim();

            return obj;
        }

        // generic type sorter
        function winnow(rows, parent, dir) {
            return rows.filter(function(row) {
                return (parent == isParent(row)) && (dir == isDir(row));
            }).map(function(row) {
                return objectify(row);
            });
        }

        function parser(opts, cb) {
            return function(page) {
                if (typeof page === "undefined") return cb("No page");

                // TODO: nix the whole rows then items thing, and just grab rows
                var rows = page.match(/<tr>(.+)<\/tr>/g);
                if (!rows) return cb("Malformed page, check the page, submit a bug?");
                var items = rows.filter(function(row) {
                    return /<td>(.+)<\/td>/.test(row);
                });

                // discover if there's a parent or not
                var parent = winnow(items, true, true);
                parent = (parent.length) ? parent[0] : null;

                var files = winnow(items, false, false);

                // TODO: filter only a type
                if (opts.type) files = files.filter(function(file) {
                    return file.type === opts.type;
                });

                cb(null, {
                    root: !parent,
                    parent: parent,
                    directories: winnow(items, false, true),
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
