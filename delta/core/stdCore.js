"use strict";

var CORE = {
    standard: function (globals) {
        let that;
        let headers;
        let countDown;

        this.functions;
        this.extension;
        this.session;


        __construct.call (this);

        function __construct () {
            that = this;

            if (!(this.session = activeSession()).active) {
                return;
            }

            countDown = new CORE.countDown (globals.logout.baseTime, globals.logout.limit, logout);
            CORE.countDown (500, checkToken, logout);

            this.functions = new FUNCTIONS;
            this.extension = {};

            //Extensions
            this.extension.notification = new EXTENSION.main;
            //

            window.addEventListener ("storage", logout);
            document.body.addEventListener ("click", countDown.reset);

            initAccessPoints ();
        }

        function activeSession () {
            let token = "[token]";
            let sessn = {
                active: true,
                logout: logout
            };

            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "authorization": `Bearer ${token}`
            };

            if (!token) {
                sessn.active = false;
                logout ();
            }

            return sessn;
        }

        function checkToken () {
            return ("[token]" === null) ? true : false;
        }

        function logout () {
            let headrs = new Headers;

            headrs.append ("authorization", headers["authorization"]);

            fetch (`${globals.backend}/MAIN/LOGOUT`, { headers: headrs }).then (function () {
                location.href = "./login.html";
            });
        }

        function initAccessPoints () {
            for (let acpt in globals.accessPoint) {
                __constructAccessPoint (globals.accessPoint[acpt]);
            }
        }

        function __constructAccessPoint (accsspnt) {
            let render = new RENDER.main ();
            let ajax = new AJAX.main ();

            render.use (accsspnt.path);
            
            ajax.route (globals.backend);
            ajax.use (accsspnt.access);
            ajax.setErrors (AJAXerror);
            ajax.setMiddleware (AJAXmiddleware);

            setHeaders (ajax);

            accsspnt.init = {
                ajax: ajax,
                render: {
                    load: render.load,
                    clear: render.clear,
                    render: render.render
                }
            };
        }

        function AJAXerror (res) {
            let status = res.status;

            if (status == 401) {
                logout ();
                return;
            }

            if (status == 999) {
                that.extension.notification.send ("w", res.message);
                return;
            }

            if (CORE.errorCodes[status]) {
                that.extension.notification.send (CORE.errorCodes[status].type, CORE.errorCodes[status].message);
            } else {
                that.extension.notification.send ("e", "Error desconocido.");

                res.text ().then (function (message) {
                    console.log (message);
                });
            }
        }

        function AJAXmiddleware (res, status) {
            if (status != 200 && status != 204) {
                res.status = 999;
                throw res;
            }
        }

        function setHeaders (ajx) {
            let h;

            for (h in headers) {
                ajx.header.append (h, headers[h]);
            }
        }
    },

    countDown: function (baseTime, baseTimeRepeat, callback) {
        let __logicalTest = (baseTimeRepeat instanceof Function) ? baseTimeRepeat : __default;

        let miliSeconds = Date.now ();
        let ctrl = true;
        let count = 0;
        let flag;


        __construct.call (this);

        function __construct () {
            if (this != CORE) {
                this.reset = function () {
                    miliSeconds = Date.now ();
                    count = 0;
                };
            }

            execute ();
        }

        function __default () {
            return (++count > baseTimeRepeat || (Date.now() - miliSeconds) >= (baseTime * baseTimeRepeat));
        }

        function execute () {
            let f = {};

            flag = f;

            setInterval (function () {
                if (flag != f || !ctrl) { return; }

                if (__logicalTest()) {
                    callback ();

                    ctrl = false;
                } else {
                    execute ();
                }
            }, baseTime);
        }
    },

    errorCodes: {
        400: {
            type: "w",
            message: "La cabecera no está correctamente formada."
        },
    
        403: {
            type: "w",
            message: "No cuenta con los permisos necesarios."
        },
    
        404: {
            type: "w",
            message: "No fue posible localizar el recurso."
        },
    
        406: {
            type: "w",
            message: "Se enviaron datos incompletos o erroneos."
        },
    
        409: {
            type: "w",
            message: "Ocurrió un conflicto con la petición."
        },
    
        500: {
            type: "e",
            message: "Ha ocurrido un error en el servidor."
        },
    
        503: {
            type: "e",
            message: "Recurso inhabilitado."
        }
    }
};
