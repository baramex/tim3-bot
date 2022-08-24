async function fastUpdate() {
    try {
        await updateBank();
    } catch (error) {
        console.error(error);
    }
}

module.exports = { fastUpdate };