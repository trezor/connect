// eslint-disable-next-line import/no-unresolved
const sigUtil = require('@metamask/eth-sig-util');

const transformTypedData = (data, metamask_v4_compat) => {
  const { types, primaryType, domain, message } = sigUtil.TypedDataUtils.sanitizeData(data);

  const version = metamask_v4_compat ?
    sigUtil.SignTypedDataVersion.V4 : sigUtil.SignTypedDataVersion.V3

  const domainSeparatorHash =  sigUtil.TypedDataUtils.hashStruct(
    'EIP712Domain',
    sanitizeData(domain),
    types,
    version,
  ).toString('hex');

  const messageHash = sigUtil.TypedDataUtils.hashStruct(
    primaryType,
    sanitizeData(message),
    types,
    version,
  ).toString('hex');

  return {
    domain_separator_hash: domainSeparatorHash,
    message_hash: messageHash,
    ...data
  }
};

// Sanitization is used for T1 as eth-sig-util does not support BigInt
function sanitizeData(data) {
  switch(Object.prototype.toString.call(data)) {
    case '[object Object]':
      let entries = Object.keys(data).map((k) => [k, sanitizeData(data[k])]);
      return Object.fromEntries(entries);

    case '[object Array]':
      return data.map((v) => sanitizeData(v));

    case '[object BigInt]':
      return data.toString();

    default:
      return data;
  }
}


exports.default = transformTypedData;
module.exports = exports.default;
