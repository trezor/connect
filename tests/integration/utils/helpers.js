const urlParams = params => Buffer.from(JSON.stringify(params)).toString('base64');

module.exports = {
    urlParams,
};
