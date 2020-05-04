export default function accessCodeResponse(accessCode) {
  return {
    id: accessCode.id,
    code: accessCode.code,
    data: accessCode.data,
    redeemedAt: accessCode.redeemedAt,
  };
}
