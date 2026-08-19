export function canStartVoiceCall() {
  return (
    window.isSecureContext &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof RTCPeerConnection !== "undefined" &&
    typeof Audio !== "undefined"
  );
}
