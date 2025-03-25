import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface TranscriptionViewerProps {
  filePath: string;
}

const TranscriptionViewer: React.FC<TranscriptionViewerProps> = ({ filePath }) => {
  const [content, setContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Failed to load transcription');
        const text = await response.text();
        setContent(text);
      } catch (error) {
        setContent('Failed to load transcription.');
      } finally {
        setLoading(false);
      }
    };

    fetchTranscription();
  }, [filePath]);

  return (
    <div className="border rounded-md p-4 bg-gray-900 text-gray-100 space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search transcription..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
      </div>
      <div className="max-h-64 overflow-auto border rounded-md p-2 bg-gray-800 text-gray-300 whitespace-pre-wrap">
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          content
            .split('\n')
            .map((line, index) => (
              <p key={index} className={searchTerm && line.includes(searchTerm) ? 'bg-yellow-500 text-black' : ''}>
                {line}
              </p>
            ))
        )}
      </div>
    </div>
  );
};

export default TranscriptionViewer;
