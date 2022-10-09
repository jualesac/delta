"use strict";

var RENDER = {
    main: function () {
        let _accessPoint = "./";
        let _url = "";
        let _config;

        this.use = function (url) {
            if (typeof(url) != "string") { new TypeError ("A string argument was expected."); }

            _accessPoint = url.trim ().replace (/\/$/, "").replace (/^(\/|(?!\/))/, "./");
        };

        this.clear = function (app, view, callback) {
            callback = callback || function () {};
            callback ();

            document.getElementById (_config[app][view].append).innerHTML = "";
        };

        this.load = function (url, callback) {
            callback = callback || function () {};

            if (typeof(url) != "string") { throw new TypeError ("A string argument was expected."); }
            if (typeof(callback) != "function") { throw new TypeError ("A function argument was expected."); }

            _url = castURL (url);

            send (true, `${_accessPoint}/${_url}/config.json`, function (res) {
                _config = JSON.parse (res);

                callback ();
            });
        };

        this.render = function (app, view, callback) {
            if (_config[app][view] == undefined) { throw new Error ("Unable to locate render object."); }
            if (_config[app][view].append == undefined || _config[app][view].append == "") { throw new Error ("Render node is not declared."); }
            if (_config[app][view].html == undefined || _config[app][view].html == "") { throw new Error ("Render html is not delcared."); }

            callback = callback || function () {};

            let config = _config[app][view];
            let uri = `${_accessPoint}/${_url}/${castURL(app)}`;

            send (false, `${uri}/${castURL(config.html)}`, function (res) {
                document.getElementById (config.append).innerHTML = res;

                rdcss (uri, config);
                rdscript (uri, config, callback);
            });
        };

        function rdcss (url, config) {
            if (config.css == undefined || config.css.trim() == "") { return; }

            let cssArray = config.css.trim ().split (/\s*,\s*/);
            let link = document.createElement ("LINK");

            link.setAttribute ("rel", "stylesheet");
            link.setAttribute ("type", "text/css");
            link.setAttribute ("href", `${url}/${castURL(cssArray[0])}`);

            document.getElementById (config.append).appendChild (link);

            cssArray.shift ();

            rdcss (url, {
                append: config.append,
                css: cssArray.join (",").trim ()
            });
        }

        function rdscript (url, config, callback) {
            if (config.script == undefined || config.script.trim() == "") {
                callback ();
                return;
            }

            let scriptArray = config.script.trim ().split (/\s*,\s*/);
            let script = document.createElement ("SCRIPT");

            script.setAttribute ("src", `${url}/${castURL(scriptArray[0])}`);
            
            scriptArray.shift ();

            script.addEventListener ("load", function () {
                rdscript (url, {
                    append: config.append,
                    script: scriptArray.join (",").trim ()
                }, callback);
            });

            document.getElementById (config.append).appendChild (script);
        }

        function castURL (url) {
            return url.trim ().replace (/^.?\//, "").replace (/^$/, ".").replace (/\/$/, "");
        }

        function send (load, uri, callback) {
            fetch (uri, {
                method: "GET",
                headers: { "Content-Type": "TEXT/PLAIN" }
            }).then (function (res) {
                if (res.ok) {
                    return res.text ();
                }

                if (load) { throw new Error ("Unable to locate configuration file."); }

                throw new Error ("Problem trying to render.");
            }).then (function (res) {
                callback (res);
            }).catch (function (err) {
                console.log (err);
            });
        }
    }
};
