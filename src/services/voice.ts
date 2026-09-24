export class VoiceService {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

  public static isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public static isSpeechRecognitionSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    );
  }

  public static speak(text: string, onEnd?: () => void): void {
    if (!this.synth) return;
    this.stopSpeaking();

    // Clean markdown before speaking
    const cleanText = text
      .replace(/[#*_`$]/g, '')
      .replace(/\[Source \d+\]/g, '')
      .replace(/\(.*?\)/g, '')
      .slice(0, 1000); // speak up to 1000 chars

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
  }

  public static stopSpeaking(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  public static createSpeechRecognizer(
    onResult: (transcript: string) => void,
    onError?: (err: any) => void
  ) {
    if (!this.isSpeechRecognitionSupported()) return null;

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognizer = new SpeechRec();
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.lang = 'en-US';

    recognizer.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };

    if (onError) {
      recognizer.onerror = onError;
    }

    return recognizer;
  }
}
