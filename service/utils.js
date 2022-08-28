function convertMonetary(inp) {
    if (typeof inp == "number") inp = inp.toString();

    const parts = inp.split(".");

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
    const y = Math.floor(ms / (1000 * 60 * 60 * 24 * 365));
    const m = Math.floor(ms / (1000 * 60 * 60 * 24 * 30)) % 12;
    const d = Math.floor(ms / (1000 * 60 * 60 * 24)) % 30;
    const h = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const min = Math.floor(ms / (1000 * 60)) % 60;
    const sec = Math.floor(ms / 1000) % 60;

    return ((y ? (y + " années ") : "") + (m ? m + " mois " : "") + (d ? d + " jours " : "") + (h ? h + " heures " : "") + (min ? min + " minutes " : "") + (sec ? sec + " secondes" : "")).trim() || "0 minutes";
}

/**
 * 
 * @param {Number} number 
 * @returns 
 */
function reduce(number, float = 1, sep = " ") {
    const scales = ["k", "m"];
    const vals = [1000, 1000000];
    let str = number.toString();
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