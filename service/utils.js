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

module.exports = { convertMonetary, durationTime };