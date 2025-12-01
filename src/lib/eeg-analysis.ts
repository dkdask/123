// EEG Analysis Module for NeuroTune
// Implements ERD-ERS, Theta+HRV Joint Analysis, and P300 Detection

/**
 * EEG Band Frequencies (Hz)
 */
export const EEG_BANDS = {
  delta: { min: 0.5, max: 4 },
  theta: { min: 4, max: 8 },
  alpha: { min: 8, max: 13 },
  beta: { min: 13, max: 30 },
  gamma: { min: 30, max: 100 },
};

/**
 * Data Types for EEG Analysis
 */
export interface RawDataPoint {
  time: Date;
  eegFp1: number;
  eegFp2: number;
  ppg: number;
}

export interface FFTDataPoint {
  time: Date;
  frequencies: { [key: string]: number };
}

export interface BiomarkerDataPoint {
  time: Date;
  fp1Delta: number;
  fp1Theta: number;
  fp1Alpha: number;
  fp1Beta: number;
  fp1Gamma: number;
  fp2Delta: number;
  fp2Theta: number;
  fp2Alpha: number;
  fp2Beta: number;
  fp2Gamma: number;
  heartbeatBpm: number;
  sdnn: number;
  rmssd: number;
  vlf?: number;
  lf?: number;
  hf?: number;
}

export interface EEGAnalysisResult {
  // ERD-ERS metrics
  erdAlpha: number;
  ersAlpha: number;
  erdBeta: number;
  ersBeta: number;
  
  // Theta and HRV metrics
  thetaLevel: number;
  sdnn: number;
  rmssd: number;
  lfHf: number;
  
  // P300 metrics
  p300Amplitude: number;
  
  // Final scores (0-1 scale)
  engagement: number;
  arousal: number;
  valence: number;
  overallPreference: number;
}

/**
 * Parse Raw EEG data from text file content
 */
export function parseRawData(content: string): RawDataPoint[] {
  const lines = content.split('\n').filter(line => line.trim());
  const dataPoints: RawDataPoint[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length >= 4) {
      try {
        // Parse time (format may vary)
        const timeStr = parts[0].trim();
        const time = parseTimeString(timeStr);
        
        dataPoints.push({
          time,
          eegFp1: parseFloat(parts[1]) || 0,
          eegFp2: parseFloat(parts[2]) || 0,
          ppg: parseFloat(parts[3]) || 0,
        });
      } catch {
        // Skip malformed lines
        continue;
      }
    }
  }
  
  return dataPoints;
}

/**
 * Parse FFT data from text file content
 */
export function parseFFTData(content: string): FFTDataPoint[] {
  const lines = content.split('\n').filter(line => line.trim());
  const dataPoints: FFTDataPoint[] = [];
  
  if (lines.length < 2) return dataPoints;
  
  // Parse header to get frequency labels
  const headerParts = lines[0].split('\t');
  const frequencyLabels = headerParts.slice(1).map(f => f.trim());
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length >= 2) {
      try {
        const timeStr = parts[0].trim();
        const time = parseTimeString(timeStr);
        
        const frequencies: { [key: string]: number } = {};
        for (let j = 1; j < parts.length && j <= frequencyLabels.length; j++) {
          frequencies[frequencyLabels[j - 1]] = parseFloat(parts[j]) || 0;
        }
        
        dataPoints.push({ time, frequencies });
      } catch {
        continue;
      }
    }
  }
  
  return dataPoints;
}

/**
 * Parse Biomarkers data from text file content
 */
export function parseBiomarkers(content: string): BiomarkerDataPoint[] {
  const lines = content.split('\n').filter(line => line.trim());
  const dataPoints: BiomarkerDataPoint[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length >= 14) {
      try {
        const timeStr = parts[0].trim();
        const time = parseTimeString(timeStr);
        
        dataPoints.push({
          time,
          fp1Delta: parseFloat(parts[1]) || 0,
          fp1Theta: parseFloat(parts[2]) || 0,
          fp1Alpha: parseFloat(parts[3]) || 0,
          fp1Beta: parseFloat(parts[4]) || 0,
          fp1Gamma: parseFloat(parts[5]) || 0,
          fp2Delta: parseFloat(parts[6]) || 0,
          fp2Theta: parseFloat(parts[7]) || 0,
          fp2Alpha: parseFloat(parts[8]) || 0,
          fp2Beta: parseFloat(parts[9]) || 0,
          fp2Gamma: parseFloat(parts[10]) || 0,
          heartbeatBpm: parseFloat(parts[11]) || 0,
          sdnn: parseFloat(parts[12]) || 0,
          rmssd: parseFloat(parts[13]) || 0,
          vlf: parts[14] ? parseFloat(parts[14]) : undefined,
          lf: parts[15] ? parseFloat(parts[15]) : undefined,
          hf: parts[16] ? parseFloat(parts[16]) : undefined,
        });
      } catch {
        continue;
      }
    }
  }
  
  return dataPoints;
}

/**
 * Parse time string from various formats
 */
function parseTimeString(timeStr: string): Date {
  // Remove any Unicode or special characters
  const cleaned = timeStr.replace(/[^\d:\s.]/g, '').trim();
  
  // Try to parse as time (HH:MM:SS.mmm)
  const timeParts = cleaned.match(/(\d+):(\d+):(\d+)(?:\.(\d+))?/);
  if (timeParts) {
    const now = new Date();
    now.setHours(parseInt(timeParts[1], 10));
    now.setMinutes(parseInt(timeParts[2], 10));
    now.setSeconds(parseInt(timeParts[3], 10));
    now.setMilliseconds(timeParts[4] ? parseInt(timeParts[4].padEnd(3, '0'), 10) : 0);
    return now;
  }
  
  return new Date();
}

/**
 * Calculate band power from FFT data for a specific frequency range
 */
function calculateBandPower(
  fftData: FFTDataPoint[],
  minFreq: number,
  maxFreq: number
): number[] {
  return fftData.map(point => {
    let totalPower = 0;
    let count = 0;
    
    for (const [freqStr, power] of Object.entries(point.frequencies)) {
      const freq = parseFloat(freqStr);
      if (freq >= minFreq && freq < maxFreq) {
        totalPower += power;
        count++;
      }
    }
    
    return count > 0 ? totalPower / count : 0;
  });
}

/**
 * Calculate Event-Related Desynchronization/Synchronization (ERD/ERS)
 * ERD: Decrease in band power (indicates increased cognitive load)
 * ERS: Increase in band power (indicates relaxation for alpha, alertness for beta)
 */
function calculateERDERS(
  fftData: FFTDataPoint[],
  band: { min: number; max: number }
): { erd: number; ers: number } {
  if (fftData.length < 4) {
    return { erd: 0, ers: 0 };
  }
  
  const bandPower = calculateBandPower(fftData, band.min, band.max);
  
  // Split into early (baseline) and late segments
  const midpoint = Math.floor(bandPower.length / 2);
  const earlySegment = bandPower.slice(0, midpoint);
  const lateSegment = bandPower.slice(midpoint);
  
  const earlyMean = earlySegment.reduce((a, b) => a + b, 0) / earlySegment.length;
  const lateMean = lateSegment.reduce((a, b) => a + b, 0) / lateSegment.length;
  
  // ERD/ERS as percentage change
  if (earlyMean === 0) {
    return { erd: 0, ers: 0 };
  }
  
  const change = ((lateMean - earlyMean) / earlyMean) * 100;
  
  return {
    erd: change < 0 ? Math.abs(change) : 0,
    ers: change > 0 ? change : 0,
  };
}

/**
 * Analyze theta band power
 * High theta indicates emotional immersion; Low theta indicates boredom
 */
function analyzeThetaLevel(biomarkers: BiomarkerDataPoint[]): number {
  if (biomarkers.length === 0) return 0.5;
  
  const avgTheta = biomarkers.reduce((sum, b) => 
    sum + (b.fp1Theta + b.fp2Theta) / 2, 0) / biomarkers.length;
  
  // Normalize to 0-1 scale (assuming theta typically ranges 0-50%)
  return Math.min(1, Math.max(0, avgTheta / 50));
}

/**
 * Analyze HRV metrics
 * High HRV: calm, positive valence
 * Low HRV: stress, tension
 */
function analyzeHRV(biomarkers: BiomarkerDataPoint[]): {
  sdnn: number;
  rmssd: number;
  lfHf: number;
} {
  if (biomarkers.length === 0) {
    return { sdnn: 0, rmssd: 0, lfHf: 1 };
  }
  
  const avgSdnn = biomarkers.reduce((sum, b) => sum + b.sdnn, 0) / biomarkers.length;
  const avgRmssd = biomarkers.reduce((sum, b) => sum + b.rmssd, 0) / biomarkers.length;
  
  // Calculate LF/HF ratio from available data
  let lfHfRatio = 1;
  const validLfHf = biomarkers.filter(b => b.lf !== undefined && b.hf !== undefined && b.hf > 0);
  if (validLfHf.length > 0) {
    lfHfRatio = validLfHf.reduce((sum, b) => sum + (b.lf! / b.hf!), 0) / validLfHf.length;
  }
  
  return {
    sdnn: avgSdnn,
    rmssd: avgRmssd,
    lfHf: lfHfRatio,
  };
}

/**
 * Detect P300 component
 * P300 is a positive peak occurring around 300ms after stimulus
 * High P300 amplitude indicates attention/interest
 */

// P300 normalization threshold in microvolts - typical P300 amplitude range
const P300_AMPLITUDE_THRESHOLD_UV = 0.0005;

function detectP300(rawData: RawDataPoint[]): number {
  if (rawData.length < 50) return 0;
  
  // Look for positive peaks around 250-350ms
  // At ~200Hz sample rate, this is approximately samples 50-70
  const p300Window = { start: 50, end: 70 };
  
  let maxAmplitude = 0;
  
  for (let i = p300Window.start; i < Math.min(p300Window.end, rawData.length); i++) {
    const fp1Amp = Math.abs(rawData[i].eegFp1);
    const fp2Amp = Math.abs(rawData[i].eegFp2);
    const avgAmp = (fp1Amp + fp2Amp) / 2;
    
    if (avgAmp > maxAmplitude) {
      maxAmplitude = avgAmp;
    }
  }
  
  // Normalize P300 amplitude to 0-1 range using typical P300 threshold
  return Math.min(1, maxAmplitude / P300_AMPLITUDE_THRESHOLD_UV);
}

/**
 * Calculate engagement score based on beta/alpha ratio and theta
 */
function calculateEngagement(
  biomarkers: BiomarkerDataPoint[],
  ersBeta: number
): number {
  if (biomarkers.length === 0) return 0.5;
  
  // Engagement correlates with higher beta and lower alpha
  const avgBetaAlphaRatio = biomarkers.reduce((sum, b) => {
    const avgAlpha = (b.fp1Alpha + b.fp2Alpha) / 2;
    const avgBeta = (b.fp1Beta + b.fp2Beta) / 2;
    return avgAlpha > 0 ? sum + avgBeta / avgAlpha : sum;
  }, 0) / biomarkers.length;
  
  // Combine with ERS beta
  const engagement = (avgBetaAlphaRatio * 0.7 + (ersBeta / 100) * 0.3);
  
  // Normalize to 0-1
  return Math.min(1, Math.max(0, engagement));
}

/**
 * Calculate arousal level
 * High arousal: increased beta, decreased alpha, higher heart rate
 */
function calculateArousal(
  biomarkers: BiomarkerDataPoint[],
  erdAlpha: number,
  ersBeta: number
): number {
  if (biomarkers.length === 0) return 0.5;
  
  // Higher beta and heart rate indicate higher arousal
  const avgHeartRate = biomarkers.reduce((sum, b) => sum + b.heartbeatBpm, 0) / biomarkers.length;
  const normalizedHR = (avgHeartRate - 60) / 60; // Normalize assuming 60-120 bpm range
  
  const avgBeta = biomarkers.reduce((sum, b) => 
    sum + (b.fp1Beta + b.fp2Beta) / 2, 0) / biomarkers.length;
  const normalizedBeta = avgBeta / 30; // Normalize assuming 0-30% range
  
  const arousal = (normalizedBeta * 0.4 + normalizedHR * 0.3 + (erdAlpha / 100) * 0.15 + (ersBeta / 100) * 0.15);
  
  return Math.min(1, Math.max(0, arousal));
}

/**
 * Calculate valence (emotional positivity)
 * Based on frontal alpha asymmetry and HRV
 */
function calculateValence(
  biomarkers: BiomarkerDataPoint[],
  hrv: { sdnn: number; rmssd: number; lfHf: number }
): number {
  if (biomarkers.length === 0) return 0.5;
  
  // Frontal alpha asymmetry: higher left alpha (Fp1) vs right (Fp2) indicates positive emotion
  const avgAsymmetry = biomarkers.reduce((sum, b) => {
    return sum + (b.fp1Alpha - b.fp2Alpha);
  }, 0) / biomarkers.length;
  
  // Normalize asymmetry (-10 to +10 typical range)
  const normalizedAsymmetry = (avgAsymmetry + 10) / 20;
  
  // Higher HRV indicates positive valence
  const normalizedHRV = Math.min(1, hrv.rmssd / 200);
  
  // Lower LF/HF ratio indicates more parasympathetic (relaxed, positive)
  const normalizedLfHf = Math.max(0, 1 - hrv.lfHf / 3);
  
  const valence = normalizedAsymmetry * 0.4 + normalizedHRV * 0.35 + normalizedLfHf * 0.25;
  
  return Math.min(1, Math.max(0, valence));
}

/**
 * Calculate overall preference score
 * Combines all metrics with weighted average
 */
function calculateOverallPreference(
  engagement: number,
  arousal: number,
  valence: number,
  thetaLevel: number,
  p300: number,
  hrv: { sdnn: number; rmssd: number }
): number {
  // Weight valence most heavily for preference
  // High theta with high HRV = emotionally relaxed immersion (positive)
  // High theta with low HRV = emotionally intense but stressed (mixed)
  // Low theta = not engaged (negative)
  
  const thetaHrvScore = thetaLevel > 0.5 && hrv.rmssd > 50 ? 0.8 :
                        thetaLevel > 0.5 && hrv.rmssd <= 50 ? 0.6 :
                        thetaLevel <= 0.5 && hrv.rmssd > 50 ? 0.4 : 0.2;
  
  const preference = (
    valence * 0.30 +
    engagement * 0.20 +
    thetaHrvScore * 0.20 +
    p300 * 0.15 +
    (1 - Math.abs(arousal - 0.5)) * 0.15 // Moderate arousal is preferred
  );
  
  return Math.min(1, Math.max(0, preference));
}

/**
 * Main EEG Analysis function
 * Processes all uploaded files and returns comprehensive analysis
 */
export function analyzeEEG(
  rawDataContent?: string,
  fp1FftContent?: string,
  fp2FftContent?: string,
  biomarkersContent?: string
): EEGAnalysisResult {
  // Parse all data
  const rawData = rawDataContent ? parseRawData(rawDataContent) : [];
  const fp1Fft = fp1FftContent ? parseFFTData(fp1FftContent) : [];
  const fp2Fft = fp2FftContent ? parseFFTData(fp2FftContent) : [];
  const biomarkers = biomarkersContent ? parseBiomarkers(biomarkersContent) : [];
  
  // Combine FFT data (average of Fp1 and Fp2)
  const combinedFft = fp1Fft.length > 0 ? fp1Fft : fp2Fft;
  
  // Calculate ERD/ERS for alpha and beta bands
  const alphaErdErs = calculateERDERS(combinedFft, EEG_BANDS.alpha);
  const betaErdErs = calculateERDERS(combinedFft, EEG_BANDS.beta);
  
  // Analyze theta
  const thetaLevel = analyzeThetaLevel(biomarkers);
  
  // Analyze HRV
  const hrv = analyzeHRV(biomarkers);
  
  // Detect P300
  const p300Amplitude = detectP300(rawData);
  
  // Calculate final scores
  const engagement = calculateEngagement(biomarkers, betaErdErs.ers);
  const arousal = calculateArousal(biomarkers, alphaErdErs.erd, betaErdErs.ers);
  const valence = calculateValence(biomarkers, hrv);
  const overallPreference = calculateOverallPreference(
    engagement, arousal, valence, thetaLevel, p300Amplitude, hrv
  );
  
  return {
    erdAlpha: alphaErdErs.erd,
    ersAlpha: alphaErdErs.ers,
    erdBeta: betaErdErs.erd,
    ersBeta: betaErdErs.ers,
    thetaLevel,
    sdnn: hrv.sdnn,
    rmssd: hrv.rmssd,
    lfHf: hrv.lfHf,
    p300Amplitude,
    engagement,
    arousal,
    valence,
    overallPreference,
  };
}

/**
 * Interpret analysis results for display
 */
export function interpretResults(results: EEGAnalysisResult): {
  moodState: string;
  emotionalProfile: string;
  recommendation: string;
} {
  // Determine mood state based on theta + HRV
  let moodState: string;
  if (results.thetaLevel > 0.5 && results.rmssd > 100) {
    moodState = 'Relaxed & Immersed';
  } else if (results.thetaLevel > 0.5 && results.rmssd <= 100) {
    moodState = 'Intense & Focused';
  } else if (results.thetaLevel <= 0.5 && results.rmssd > 100) {
    moodState = 'Calm but Disengaged';
  } else {
    moodState = 'Stressed or Aversive';
  }
  
  // Determine emotional profile
  let emotionalProfile: string;
  if (results.valence > 0.6 && results.arousal > 0.5) {
    emotionalProfile = 'Happy & Energetic';
  } else if (results.valence > 0.6 && results.arousal <= 0.5) {
    emotionalProfile = 'Content & Relaxed';
  } else if (results.valence <= 0.6 && results.arousal > 0.5) {
    emotionalProfile = 'Tense & Alert';
  } else {
    emotionalProfile = 'Calm & Neutral';
  }
  
  // Generate recommendation
  let recommendation: string;
  if (results.overallPreference > 0.7) {
    recommendation = 'This type of music is highly recommended for you!';
  } else if (results.overallPreference > 0.5) {
    recommendation = 'This music style works well for you in certain contexts.';
  } else if (results.overallPreference > 0.3) {
    recommendation = 'This music may be suitable for specific moods only.';
  } else {
    recommendation = 'This music style may not be the best fit for you.';
  }
  
  return { moodState, emotionalProfile, recommendation };
}

/**
 * Context-based recommendation scoring
 */
export interface ContextScores {
  study: number;
  workout: number;
  rest: number;
  presleep: number;
  commute: number;
  stressRelief: number;
  feelingGood: number;
}

export function getContextScores(results: EEGAnalysisResult): ContextScores {
  return {
    // Study: High engagement, moderate arousal
    study: results.engagement * 0.5 + (1 - Math.abs(results.arousal - 0.5)) * 0.3 + results.valence * 0.2,
    
    // Workout: High arousal, high engagement
    workout: results.arousal * 0.5 + results.engagement * 0.3 + results.ersBeta / 100 * 0.2,
    
    // Rest: Low arousal, high valence
    rest: (1 - results.arousal) * 0.4 + results.valence * 0.4 + results.ersAlpha / 100 * 0.2,
    
    // Pre-sleep: Very low arousal, moderate valence
    presleep: (1 - results.arousal) * 0.5 + results.ersAlpha / 100 * 0.3 + (results.rmssd / 200) * 0.2,
    
    // Commute: Moderate engagement, moderate arousal
    commute: (1 - Math.abs(results.engagement - 0.5)) * 0.4 + (1 - Math.abs(results.arousal - 0.5)) * 0.4 + results.valence * 0.2,
    
    // Stress relief: High HRV response, lower arousal
    stressRelief: (results.rmssd / 200) * 0.4 + (1 - results.arousal) * 0.3 + results.valence * 0.3,
    
    // Feeling good: High valence, high engagement
    feelingGood: results.valence * 0.5 + results.engagement * 0.3 + results.overallPreference * 0.2,
  };
}
