function convertMonetary(inp) {
    if (typeof inp == "number") inp = inp.toString();

    var parts = inp.split(".");

    const numberPart = parts[0];
    const decimalPart = parts[1];
    const thousands = /\B(?=(\d{3})+(?!\d))/g;
    return numberPart.replace(thousands, "'") + (decimalPart ? "." + decimalPart : "");
}

/**
 * 
 * @param {number} ms 
 * @returns {string}
 */
function durationTime(ms) {
    var y = Math.floor(ms / (1000 * 60 * 60 * 24 * 365));
    var m = Math.floor(ms / (1000 * 60 * 60 * 24 * 30)) % 12;
    var d = Math.floor(ms / (1000 * 60 * 60 * 24)) % 30;
    var h = Math.floor(ms / (1000 * 60 * 60)) % 24;
    var min = Math.floor(ms / (1000 * 60)) % 60;

    return ((y ? (y + " années ") : "") + (m ? m + " mois " : "") + (d ? d + " jours " : "") + (h ? h + " heures " : "") + (min ? min + " minutes " : "")).trim() || "0 minutes";
}

/**
 * 
 * @param {Number} number 
 * @returns 
 */
function reduce(number, float = 1, sep=" ") {
    var scales = ["k", "m"];
    var vals = [1000, 1000000];
    var str = number.toString();
    scales.forEach((scale, i) => {
        var res = (number / vals[i]).toFixed(float);
        if (res >= 1) {
            str = res + sep + scale;
        }
        else return;
    });
    return str;
}

module.exports = { convertMonetary, durationTime, reduce };