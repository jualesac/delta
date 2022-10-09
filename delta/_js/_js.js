"use strict";

(function (clase) {
    if (window._js == undefined) {
        clase ();
    }
}) (function () {
    let js = function (selector) {
        let objHTML;
        let qs;

        if (arguments.length === 0) {
            throw new Error ("Se esperaba un argumento");
        }

        if (selector instanceof Element) { return selector; }

        qs = document.querySelectorAll (selector);

        objHTML = (qs.length > 1) ? qs : (document.querySelector (selector)) ? document.querySelector (selector) : document.getElementById (selector);

        if (objHTML === null) { return null; }

        return objHTML;
    };

    js.createElement = function (element, ns) {
        ns = ns || "";

        checkType (element, "string");

        let elmnt;

        if (ns === "") {
            elmnt = document.createElement (element);
        } else {
            elmnt = document.createElementNs (ns, element);
        }

        return elmnt;
    };

    let protoHtml = HTMLElement.prototype;
    let protoList = NodeList.prototype;

    protoHtml.removeElement = protoList.removeElement = fn (function () {
        this.parentNode.removeChild (this);
    }, false);

    protoHtml.event = protoList.event = fn (function (evnt, callback) {
        this.addEventListener (evnt, callback);
    }, false);

    protoHtml.rmEvent = protoList.rmEvent = fn (function (evnt, callback) {
        this.removeEventListener (evnt, callback);
    }, false);

    protoHtml.addStyle = protoList.addStyle = fn (function (style) {
        checkType (style, "string");

        let regExp = new RegExp (`(?:^| )${style}(?: |$)`);

        if (!regExp.test (this.className)) {
            this.className = (`${this.className} ${style}`).trim ();
        }
    });

    protoHtml.rmStyle = protoList.rmStyle = fn (function (style) {
        checkType (style, "string");

        let regExp = new RegExp (`(?:^| )${style}(?: |$)`);

        this.className = this.className.replace (regExp, "").trim ();
    });

    protoHtml.addrmStyle = protoList.addrmStyle = fn (function (style) {
        checkType (style, "string");

        let regExp = new RegExp (`(?:^| )${style}(?: |$)`);

        if (regExp.test (this.className)) {
            this.className = this.className.replace (regExp, "").trim ();
        } else {
            this.className = (`${this.className} ${style}`).trim ();
        }
    });

    protoHtml.addrmStyleValue = protoList.addrmStyleValue = fn (function (property, value) {
        checkType (property, "string");

        let obj = this.style;

        if (obj[property] === "" || !(obj[property])) {
            obj[property] = value;
        } else {
            obj[property] = "";
        }
    });

    protoHtml.setAttributes = protoList.setAttributes = fn (function (json) {
        checkInstance (json, Object, "Object");

        let attribute;

        try {
            for (attribute in json) {
                this.setAttribute (attribute, json[attribute]);
            }
        } catch (error) {
            if (json instanceof Array) {
                throw new TypeError ("Se esperaba un Object como argumento");
            }

            throw new Error (error);
        }
    });

    protoHtml.setProperties = protoList.setProperties = fn (function (json) {
        checkInstance (json, Object, "Object");

        let property;

        for (property in json) {
            this[property] = json[property];
        }
    });

    protoHtml.clone = protoList.clone = fn (function (callback, boolChild) {
        if (typeof (callback) !== "function") {
            boolChild = callback;
            callback = function () { return; };
        }

        boolChild = boolChild || false;

        checkInstance (callback, Function, "Function");
        checkType (boolChild, "boolean");

        let clon = this.cloneNode (boolChild);

        callback (clon);

        this.parentNode.appendChild (clon);
    });

    protoHtml.appendTo = protoList.appendTo = fn (function (parent) {
        parent = js(parent);

        parent.appendChild (this);
    });

    protoHtml.currentChildNumber = function () {
        let parent = this.parentNode;
        let i;

        for (i in parent.children) {
            if (this == parent.children[i]) {
                break;
            }
        }

        return i;
    };

    protoHtml.findParent = function (parentName, strct) {
        strct = strct == undefined ? true : strct;

        return findParentElement (this, parentName, strct);
    };

    protoHtml.replace = fn (function (oldObj) {
        let obj;

        obj = js(oldObj);

        obj.parentNode.replaceChild (this, obj);
    });

    protoHtml.keyBlock = protoList.keyBlock = fn (function (rgExpBlock, callbackEnter) {
        callbackEnter = callbackEnter || function () {};

        checkInstance (this, HTMLElement, "HTMLElement");
        checkInstance (callbackEnter, Function, "Function");

        let special;
        let regExp;

        special = new RegExp ("Control|Arrow|Space|Backspace|Tab|Home|End|Delete|Insert|Dead|F[0-9]{1,2}");
        regExp = new RegExp (`(?:${rgExpBlock})`);

        this.addEventListener ("keydown", validate);
        this.addEventListener ("keyup", gate);

        function validate (evnt) {
            let key;

            key = evnt.key;

            if (/Enter/.test (key)) {
                lock.call (this);
                callbackEnter ();
                return;
            }

            if (regExp.test (key)) {
                if (special.test (key)) {
                    this.addEventListener ("blur", lock);
                    this.removeEventListener ("keydown", validate);
                } else {
                    evnt.preventDefault ();
                }
            }
        }

        function gate (evnt) {
            let key;

            key = evnt.key;

            if (special.test (key)) {
                lock.call (this);
            }
        }

        function lock () {
            this.addEventListener ("keydown", validate);
            this.removeEventListener ("blur", lock);

            if (regExp.test (this.value)) {
                this.value = this.value.split (regExp).join ("");
            }
        }
    }, false);

    protoHtml.structBlock = protoList.structBlock = fn (function (struct, callbackEnter) {
        callbackEnter = callbackEnter || function () {};

        checkInstance (this, HTMLElement, "HTMLElement");
        checkInstance (callbackEnter, Function, "Function");

        let special;
        let regExp;

        special = new RegExp ("Control|Arrow|Backspace|Tab|Home|End|Delete|Insert|Shift|F[0-9]{1,2}");
        regExp = new RegExp (`^${struct}$`);

        this.addEventListener ("keydown", validate);
        this.addEventListener ("keyup", gate);

        function validate (evnto) {
            let key;
            let value;

            key = evnto.key;
            value = this.value;

            if (/Enter/.test (key)) {
                lock.call (this);
                callbackEnter ();
                return;
            }

            if (!special.test (key)) {
                if (!((regExp.test (value + key)) && (key.length === 1))) {
                    evnto.preventDefault ();
                }
            } else {
                this.addEventListener ("blur", lock);
                this.removeEventListener ("keydown", validate);
            }
        }

        function gate (evnto) {
            let key;

            key = evnto.key;

            if (special.test (key)) {
                lock.call (this);
            }
        }

        function lock () {
            this.addEventListener ("keydown", validate);
            this.removeEventListener ("blur", lock);

            if (!regExp.test (this.value)) {
                this.value = "";
            }
        }
    }, false);

    function findParentElement (obj, element, strct) {
        strct = strct == undefined ? true : strct;
        element = element.toUpperCase ();

        if ((obj.tagName == element && !strct) || obj.tagName == "HTML") {
            return obj;
        }

        let name = obj.parentElement.tagName;
        let o;

        if (name == element) {
            o = obj.parentElement;
        } else {
            o = findParentElement (obj.parentElement, element);
        }

        return o;
    }
    //Constructor de métodos
    function fn (callback, retur) {
        retur = (retur === true || retur === undefined) ? true : false;

        return function (...arg) {
            if (this instanceof HTMLElement) {
                callback.call (this, ...arg);
            } else if (this instanceof NodeList) {
                this.forEach (function (item) {
                    callback.call (item, ...arg);
                });
            } else {
                return null;
            }

            if (retur) {
                return this;
            }
        };
    }

    function checkInstance (obj, instance, alias) {
        if (!(obj instanceof instance)) {
            throw new TypeError (`Se esperaba un objeto ${alias} como argumento.`);
        }
    }

    function checkType (argument, type) {
        if (typeof (argument) !== type) {
            throw new TypeError (`Se esperaba un ${type} como argumento.`);
        }
    }

    window._js = js;
});
