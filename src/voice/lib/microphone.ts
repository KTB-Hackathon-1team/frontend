type ChildMicConstraints = MediaTrackConstraints & {
  voiceIsolation?: boolean | { ideal: boolean };
};

const CHILD_MIC: ChildMicConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: false,
};

export async function openChildMicrophone(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { ...CHILD_MIC, voiceIsolation: true } as MediaTrackConstraints,
    });
  } catch {
    return navigator.mediaDevices.getUserMedia({ audio: CHILD_MIC });
  }
}

export function stopChildMicrophone(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}
