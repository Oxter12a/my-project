// Returns the cleaned phone number, or null if it does not look like a phone number.
// Accepts digits, spaces, dashes, brackets and an optional leading +  (7-15 digits).
module.exports = function cleanPhone(value) {

    const phone = String(value || "").trim();

    if (!/^\+?[0-9\s\-()]+$/.test(phone)) return null;

    const digits = phone.replace(/\D/g, "");

    if (digits.length < 7 || digits.length > 15) return null;

    return phone;
};
