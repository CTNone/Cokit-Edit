function createInteractionError(kind, message, extra = {}) {
  const error = new Error(message);
  error.kind = kind;
  Object.assign(error, extra);
  return error;
}

function getErrorLabel(kind) {
  switch (kind) {
    case 'selector_fail':
      return 'Selector fail';
    case 'action_fail':
      return 'Action fail';
    case 'assertion_fail':
      return 'Assertion fail';
    case 'timeout_fail':
      return 'Timeout fail';
    case 'blocked':
      return 'Blocked';
    default:
      return 'Interaction fail';
  }
}

module.exports = {
  createInteractionError,
  getErrorLabel,
};
