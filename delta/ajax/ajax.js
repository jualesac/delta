"use strict";

var AJAX = {
    main: function (URLStatic) {
        URLStatic = (URLStatic == undefined) ? true : (URLStatic || false);
        
        let route = "";
        let routeDef = "";
        let headers = new Headers;
        let errors = function (err) { throw { type: "error", message: "Ocurrió un problema con la petición al servidor" }; };
        let middle = function (res, status) {};

        this.header = headers;
        this.route = function (rte) {
            if (typeof (rte) !== "string") { throw new TypeError ("Se esperaba un string"); }

            route = rte.replace (/\#|\/$/, "").trim ();
        };

        this.use = function (rte) {
            if (typeof (rte) !== "string") { throw new TypeError ("Se esperaba un string"); }

            routeDef = rte.replace (/\#|\/$/, "").trim ();
        };

        this.setErrors = function (callback) {
            if (!(callback instanceof Function)) { throw new TypeError ("Se esperaba una función como argumento"); }
            
            errors = callback;
        };
        
        this.setMiddleware = function (callback) {
            if (!(callback instanceof Function)) { throw new TypeError ("Se esperaba una función como argumento"); }
            
            middle = callback;
        };

        this.get = function (callback, values, url, boolMiddle) {
            if (typeof (values) === "string") {
                url = values;
                values = {};
            }

            values = values || {};

            let strVal = JSONStringURL (values);

            if (strVal !== "") {
                url = url + `?${strVal}`;
            }

            send (true, true, "GET", {}, url, undefined, callback, boolMiddle);
        };

        this.post = function (callback, values, url, boolMiddle) {
            send (true, true, "POST", undefined, url, values, callback, boolMiddle);
        };

        this.put = function (callback, values, url, boolMiddle) {
            send (true, true, "PUT", undefined, url, values, callback, boolMiddle);
        };

        this.delete = function (callback, values, url, boolMiddle) {
            send (true, true, "DELETE", undefined, url, values, callback, boolMiddle);
        };

        this.form = function (callback, form, url, boolMiddle) {
            let content;
            let params = {};

            params.body = (form instanceof FormData) ? form : new FormData (document.getElementById (form));
            content = headers.get ("Content-Type");

            headers.delete ("Content-Type");

            send (true, true, "POST", params, url, undefined, callback, boolMiddle);

            if (content != "") { headers.append ("Content-Type", content); }
        };

        this.text = function (callback, url, content) {
            let params = {};
            let _route = route;
            let _routeDef = routeDef;

            params.headers = {
                "Content-Type": content || "TEXT/PLAIN"
            };

            route = "";
            routeDef = "";

            send (false, false, "GET", params, url, undefined, callback, false);

            route = _route;
            routeDef = _routeDef;
        };

        function send (json, header, method, params, url, values, callback, boolMiddle) {
            boolMiddle = (boolMiddle == undefined) ? true : boolMiddle;
            params = params || {
                body: JSONStringURL (values)
            };

            params.method = method;

            if (header) {
                params.headers = headers;
            }

            request (url, params, callback, json, boolMiddle);
        }

        function request (url, params, callback, json, boolMiddle) {
            if (typeof (url) != "string") { throw new TypeError ("Se esperaba un string como argumento"); }
            if (typeof (params) != "object") { throw new TypeError ("Se esperaba un objeto como argumento"); }
            if (typeof (callback) != "function") { throw new TypeError ("Se esperaba una función como argumento"); }
            if (typeof (json) != "boolean") { throw new TypeError ("Se esperaba un booleano como argumento"); }

            let uri = (URLStatic ? (route + routeDef + (url || "")) : routeDef + url) || route + routeDef;

            let status;

            fetch (uri, params).then (function (res) {
                if (res.ok) {
                    status = res.status;

                    if (res.status != 204 && res.status != 205) {
                        if (json) {
                            return res.json ();
                        } else {
                            return res.text ();
                        }
                    }

                    if (boolMiddle) { middle (res, status); }
                    callback (res, status);
                } else {
                    throw res;
                }
                
                return;
            }).then (function (res) {
                if (res == undefined) { return; }

                if (boolMiddle) { middle (res, status); }
                callback (res, status);
            }).catch (function (err) {
                if (!(err instanceof Error)) {
                    errors (err);
                } else {
                    throw { url: uri, type: "error", message: err };
                }
            });
        }

        function JSONStringURL (values) {
            let val = [];

            for (let v in values) {
                val.push (`${v}=${encodeURIComponent (values[v])}`);
            }

            return val.join ("&");
        }
    }
};
