export function playNotificationSound(): void {
  try {
    const AudioContextCtor: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.06;
    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);
    oscillator.onended = () => { void context.close(); };
  } catch {
    // Audio is a nice-to-have; ignore failures.
  }
}
