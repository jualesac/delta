"use strict";

var FUNCTIONS = function () {
    this.format = {
        money: function (number) {
            if (/[^0-9.\-]/.test (number) || number == "") {
                return "0.00";
            }

            let negative = /^-/.test (number);
            let decimals = /\.\d*$/.test (number) ? /\.(\d*)$/.exec (number)[1] : "00";

            number = number.split (/^-?0*|\.\d*$/).join ("");
            number = setComma (number);

            if (decimals == "") { decimals = "00"; }
            if (decimals.length == 1) { decimals = decimals + "0"; }

            return `${(negative ? "-" : "")}${number}.${decimals}`;

            function setComma (n) {
                if (n == "") { return ""; }

                let split = n.split (/(\d{1,3})$/);

                n = setComma (split[0]) + "," + split[1];

                return n.split (/^,/).join ("");
            }
        },

        number: function (number) {
            if (/[^0-9.,$€¢¥₹ \-]/.test (number) || number == "") {
                return "0";
            }

            let negative = /^-/.test (number);

            number = number.split (/[^0-9.]/).join ("");
            number = number.split (/\.0*$/).join (".");
            number = number.split (/^0*/).join ("");
            number = number.split (/\.$/).join ("");
            number = number.split (/^\./).join ("0.");

            if (number == "") { return "0"; }
            if (/\.\d+$/.test (number)) { number = number.split (/0+$/).join (""); }

            return `${(negative ? "-" : "")}${number}`;
        }
    };
};
