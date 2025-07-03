
import React from 'react';
import { Link, Sparkles } from 'lucide-react';
import { TokenData } from './types';

interface TokenURLsDisplayProps {
  tokenData: TokenData;
}

export const TokenURLsDisplay: React.FC<TokenURLsDisplayProps> = ({ tokenData }) => {
  return (
    <div className="space-y-1 text-xs text-gray-500">
      <div className="flex items-center">
        <Link className="h-3 w-3 inline mr-1" />
        <span>רגיל: {tokenData.submissionUrl}</span>
      </div>
      <div className="flex items-center">
        <Sparkles className="h-3 w-3 inline mr-1" />
        <span>מתקדם: {tokenData.advancedSubmissionUrl}</span>
      </div>
    </div>
  );
};
