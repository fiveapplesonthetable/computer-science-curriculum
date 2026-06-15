# Signal Processing From the Ground Up
### The Geometry of Frequency — From Sinusoids to a Wrist-Worn Gesture Tracker

A self-contained, intuition-first signal processing book. It builds the geometry
of functions so you can genuinely *feel* what frequency and the Fourier transform
mean, then carries that all the way through filtering, sampling, audio, images,
and inertial (accelerometer/gyroscope) sensing — ending in a full capstone:
designing a **wrist-worn tracker that infers finger movements from wrist motion
for playing instruments**, on an Arduino or Raspberry Pi. Hundreds of pages, the
same conversational voice and visual language as the companion *Calculus*,
*Linear Algebra*, *Probability*, and *Algorithms From the Ground Up*.

## What it covers

- **Signals and the geometry of functions** — what a signal is, continuous vs
  discrete, signals as vectors (inner products, orthogonality), and sinusoids,
  phasors, and complex exponentials.
- **Frequency and the Fourier family** — the idea of frequency, Fourier series,
  the Fourier transform, the DFT, the FFT, the short-time Fourier transform and
  spectrograms, and the properties (convolution theorem) that make it all click.
- **Systems and filtering** — LTI systems, convolution, impulse/frequency
  response, the z- and Laplace transforms, filter design (FIR/IIR), and
  practical real-time filtering.
- **Sampling and real signals** — sampling and Nyquist (aliasing), quantization
  and ADC/DAC, noise and SNR, and spectral estimation.
- **Multirate, modulation, time-frequency** — resampling, modulation and I/Q,
  wavelets, and the Hilbert/analytic signal (envelopes, instantaneous frequency).
- **Audio** — digital audio, audio features (MFCCs, pitch, onsets), effects and
  synthesis, and music/instrument signals.
- **Images** — images as 2D signals, 2D Fourier and filtering, edges/features
  and the 2D convolution (link to CNNs), transforms and compression (DCT/JPEG).
- **Inertial sensors and motion** — accelerometers/gyros/magnetometers,
  calibration, orientation estimation and sensor fusion (complementary and
  Kalman/Madgwick filters), gesture/activity recognition, and ML on signals.
- **Building it** — embedded DSP on Arduino and Raspberry Pi, and the capstone
  wrist finger-gesture instrument tracker, end to end.

## Build

```bash
./build.sh           # writes dist/signal-processing-from-the-ground-up.pdf
```

Requires a TeX Live install with `tcolorbox`, `tikz`, `pgfplots`, and
`listings`. Sources are in `src/`, the rendered PDF lands in `dist/`.

## License

MIT — see `LICENSE`.
