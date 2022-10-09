"use strict";

CORE.main = function (globals) {
    let stdCore = new CORE.standard (globals);

    let index;
    let apps;

    let extension;
    let session;
    let exec;
    let fn;


    __construct ();

    function __construct () {
        if (!stdCore.session.active) { return; }

        index = globals.accessPoint.index.init;
        apps = globals.accessPoint.apps.init;
        
        extension = stdCore.extension;
        session = stdCore.session;
        fn = stdCore.functions;

        index.render.load ("", __initIndex);
    }

    function __initIndex () {
        index.render.render ("index", "crm", function () {
            fn.fx = new FX.main;

            CONTROLLER.main (__usageData(index));
        });
    }

    function __initApp (evnt) {
        //code...
        apps.render.load ("/app", function () {
            apps.render.render ("app1", "index", function () {
                CONTROLLER.app (__usageData(apps));
            });
        });
    }

    function __usageData (accessPointInit) {
        return {
            render: accessPointInit.render,
            extension: extension,
            session: session,
            fn: fn,
            ajax: {
                get: accessPointInit.ajax.get,
                put: accessPointInit.ajax.put,
                post: accessPointInit.ajax.post,
                text: accessPointInit.ajax.text,
                form: accessPointInit.ajax.form,
                delete: accessPointInit.ajax.delete
            }
        };
    }
};
