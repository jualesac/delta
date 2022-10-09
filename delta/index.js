/*
 * FECHA: 2022/10/09
 * AUTOR: Julio Alejandro Santos Corona
 * CORREO: jualesac@yahoo.com
 * TÍTULO: _js.js
 *
 * Descripción: Ejecuci
*/

"use strict";

async function delta (callback) {
    let response = await fetch (atob("Li9kZWx0YS9jb3JlX2NvbmZpZy5qc29u"));
    let text = await response.text ();
    let core = JSON.parse (text);

    let modules = iterate (core.modules);
    let extensions = iterate (core.extensions);

    load (
        modules,
        function () {
            load (extensions, callback);
        }
    );

    function* iterate (obj) {
        let i = 0;

        while (true) {
            yield obj[i++];
        }
    }

    function load (iter, cllbck) {
        let element = iter.next().value;

        if (element === undefined) {
            cllbck (core.config);
            return;
        }

        let script = document.createElement ("script");

        script.setAttribute ("src", `${atob("Li9kZWx0YS8=")}${element}`);
        script.addEventListener ("load", ld);

        document.head.appendChild (script);

        function ld () {
            script.removeEventListener ("load", ld);

            load (iter, cllbck);
        }
    }
}

window.onload = delta (function (config) {
    try {
        CORE.main (config);
    } catch (err) {
        console.log (err);
    }
});
