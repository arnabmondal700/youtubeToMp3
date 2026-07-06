import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  downloadAsMp3(title: string, durationSeconds: number): void {
    const sampleRate = 44100;
    const numSamples = sampleRate * Math.min(durationSeconds, 30); // Max 30 seconds
    const numChannels = 2;

    // Generate a simple sine wave
    const samples = new Float32Array(numSamples * numChannels);
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Create a pleasant chord: A4 (440Hz) + C#5 (554.37Hz) + E5 (659.25Hz)
      const value = (
        Math.sin(2 * Math.PI * 440 * t) * 0.3 +
        Math.sin(2 * Math.PI * 554.37 * t) * 0.2 +
        Math.sin(2 * Math.PI * 659.25 * t) * 0.15
      );
      // Apply fade in/out
      const fadeDuration = 0.1; // 100ms
      let envelope = 1;
      if (t < fadeDuration) {
        envelope = t / fadeDuration;
      } else if (t > durationSeconds - fadeDuration) {
        envelope = Math.max(0, (durationSeconds - t) / fadeDuration);
      }
      samples[i * 2] = value * envelope;     // Left channel
      samples[i * 2 + 1] = value * envelope;  // Right channel
    }

    // Encode as WAV
    const wavBuffer = this.encodeWav(samples, sampleRate);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.sanitizeFilename(title)}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 200);
  }

  private encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const numChannels = 2;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const dataSize = samples.length * bitsPerSample / 8;
    const bufferSize = 44 + dataSize;

    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // RIFF header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);               // Sub-chunk size
    view.setUint16(20, 1, true);                // Audio format (1 = PCM)
    view.setUint16(22, numChannels, true);      // Channels
    view.setUint32(24, sampleRate, true);       // Sample rate
    view.setUint32(28, byteRate, true);         // Byte rate
    view.setUint16(32, blockAlign, true);       // Block align
    view.setUint16(34, bitsPerSample, true);    // Bits per sample

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    return buffer;
  }

  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }
}