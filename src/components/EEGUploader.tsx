'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';

interface UploadedFile {
  name: string;
  content: string;
  type: 'rawdata' | 'fp1_fft' | 'fp2_fft' | 'biomarkers';
}

interface EEGUploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  isProcessing?: boolean;
}

const FILE_TYPES = [
  { key: 'rawdata', label: 'Rawdata.txt', description: 'Raw Fp1/Fp2/PPG time series' },
  { key: 'fp1_fft', label: 'Fp1_FFT.txt', description: 'FFT power per frequency (Fp1)' },
  { key: 'fp2_fft', label: 'Fp2_FFT.txt', description: 'FFT power per frequency (Fp2)' },
  { key: 'biomarkers', label: 'Biomarkers.txt', description: 'Band percentages + HRV' },
] as const;

export function EEGUploader({ onFilesUploaded, isProcessing = false }: EEGUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, UploadedFile>>(new Map());
  const [dragActive, setDragActive] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent, type: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(type);
  }, []);

  const handleDrop = useCallback(async (
    e: React.DragEvent,
    fileType: typeof FILE_TYPES[number]['key']
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const content = await readFileContent(file);
      
      const newFile: UploadedFile = {
        name: file.name,
        content,
        type: fileType,
      };
      
      setUploadedFiles(prev => {
        const updated = new Map(prev);
        updated.set(fileType, newFile);
        return updated;
      });
    }
  }, []);

  const handleFileSelect = useCallback(async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: typeof FILE_TYPES[number]['key']
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const content = await readFileContent(file);
      
      const newFile: UploadedFile = {
        name: file.name,
        content,
        type: fileType,
      };
      
      setUploadedFiles(prev => {
        const updated = new Map(prev);
        updated.set(fileType, newFile);
        return updated;
      });
    }
  }, []);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleSubmit = () => {
    const files = Array.from(uploadedFiles.values());
    onFilesUploaded(files);
  };

  const allFilesUploaded = FILE_TYPES.every(ft => uploadedFiles.has(ft.key));
  const someFilesUploaded = uploadedFiles.size > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-white mb-6 text-center">
        Upload EEG Data Files
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {FILE_TYPES.map((fileType) => {
          const isUploaded = uploadedFiles.has(fileType.key);
          const uploadedFile = uploadedFiles.get(fileType.key);
          
          return (
            <motion.div
              key={fileType.key}
              whileHover={{ scale: 1.02 }}
              className={`
                relative p-4 rounded-xl border-2 border-dashed
                transition-colors duration-200
                ${dragActive === fileType.key 
                  ? 'border-purple-500 bg-purple-500/20' 
                  : isUploaded 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-600 bg-gray-800/50 hover:border-purple-400'
                }
              `}
              onDragEnter={(e) => handleDrag(e, fileType.key)}
              onDragLeave={(e) => handleDrag(e, null)}
              onDragOver={(e) => handleDrag(e, fileType.key)}
              onDrop={(e) => handleDrop(e, fileType.key)}
            >
              <input
                type="file"
                accept=".txt"
                onChange={(e) => handleFileSelect(e, fileType.key)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="flex flex-col items-center text-center">
                <AnimatePresence mode="wait">
                  {isUploaded ? (
                    <motion.div
                      key="uploaded"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mb-2"
                    >
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <p className="text-sm font-medium text-white">{fileType.label}</p>
                <p className="text-xs text-gray-400 mt-1">{fileType.description}</p>
                
                {uploadedFile && (
                  <p className="text-xs text-green-400 mt-2 truncate max-w-full">
                    ✓ {uploadedFile.name}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!someFilesUploaded || isProcessing}
          isLoading={isProcessing}
        >
          {isProcessing ? 'Analyzing...' : allFilesUploaded ? 'Analyze All Files' : 'Analyze Available Files'}
        </Button>
      </div>
      
      <p className="text-center text-gray-500 text-xs mt-4">
        Drag and drop files or click to browse. At least one file is required.
      </p>
    </div>
  );
}

export default EEGUploader;
