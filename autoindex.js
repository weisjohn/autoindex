
// parse an autoindex page into JSON

// TODO: make jQuery optional

(function() {

    function autoindex(url, opts, cb) {

        // validation / options
        if (typeof url !== "string") return cb('URL must be a string');
        var root = url.match(/^(.*\/\/[^\/?#]*).*$/)[1];
        if (typeof opts === "function") cb = opts, opts = {};


        // helper functions
        // TODO: turn into an object
        function objectify(str, should_console) {

            var obj = {};
            // find the href of the file
            obj.href = str.match(/href\=\"([^\"]*)\"/)[1];
            obj.url = (isDir(str) ? (root + "/") : url) + obj.href;

            // find the file name (preserve truncation)
            obj.name = str.match(/<a href\=\"(?:[^\"]*)\">(.+)<\/a>/)[1];
            
            // TODO: parse out the bytes
            // obj.bytes = str.match('/')

            if (should_console) console.log(str);

            return obj;
        }

        function isDir(str) {
            return /alt\=\"\[DIR\]\"/.test(str);
        }

        function isParent(str) {
            return /Parent Directory/.test(str);
        }


        function parser(opts, cb) {
            return function(page) {
                if (typeof page === "undefined") return cb("No page");

                // TODO: nix the next line
                window.p = page;

                // TODO: nix the whole rows then items thing, and just grab rows
                var rows = page.match(/<tr>(.+)<\/tr>/g);
                var items = rows.filter(function(row) {
                    return /<td>(.+)<\/td>/.test(row);
                });

                var parent = items.filter(function(item) {
                    return isDir(item) && isParent(item);
                });
                parent = (parent.length) ? objectify(parent[0]) : null;

                var dirs = items.filter(function(item) {
                    return isDir(item) && !isParent(item);
                });
                if (dirs.length) dirs = dirs.map(function(dir) { return objectify(dir) });

                var files = items.filter(function(item) {
                    return !isDir(item) && !isParent(item);
                });
                if (files.length) files = files.map(function(dir) { return objectify(dir, true) });

                cb(null, {
                    root: !parent,
                    parent: parent,
                    directories: dirs,
                    files: files
                });

            }
        }

        // TODO: try to support something other than jQuery?
        $.ajax(url).then(parser(opts, cb), function(j, t, e) {
            cb(e);
        });
    }

    // TODO: the whole module.exports / require thing
    window.autoindex = autoindex;

})();