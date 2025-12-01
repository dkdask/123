import { NextRequest, NextResponse } from 'next/server';
import { analyzeEEG, interpretResults, getContextScores } from '@/lib/eeg-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawData, fp1Fft, fp2Fft, biomarkers } = body;
    
    // Validate that at least one file was provided
    if (!rawData && !fp1Fft && !fp2Fft && !biomarkers) {
      return NextResponse.json(
        { error: 'At least one EEG data file is required' },
        { status: 400 }
      );
    }
    
    // Perform EEG analysis
    const analysisResults = analyzeEEG(rawData, fp1Fft, fp2Fft, biomarkers);
    
    // Get interpretation
    const interpretation = interpretResults(analysisResults);
    
    // Get context scores
    const contextScores = getContextScores(analysisResults);
    
    return NextResponse.json({
      success: true,
      analysis: analysisResults,
      interpretation,
      contextScores,
    });
  } catch (error) {
    console.error('EEG Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze EEG data', message: (error as Error).message },
      { status: 500 }
    );
  }
}
