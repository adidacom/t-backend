export default function errorResponse(message, extra = {}) {
  return {
    message: message,
    extra: extra,
  };
}
