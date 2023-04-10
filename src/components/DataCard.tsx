// src/components/DataCard.tsx

import React from 'react';

interface CardProps {
  title: string;
  data: any;
  endpoint: string;
}


const DataCard: React.FC<CardProps> = ({ title, data, endpoint }) => {
  const shareToTwitter = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/${endpoint}`;
    const tweetText = encodeURIComponent(`${title}\n\n${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  return (
    <div className="flex justify-center space-x-4 w-full sm:w-96 h-60 bg-white shadow rounded-xl mb-4 p-4">
    <div className="bg-white shadow rounded mb-4 p-4">
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-gray-700 mb-4">{JSON.stringify(data)}</p>
      <button
        className="bg-black text-white px-4 py-2 rounded"
        onClick={shareToTwitter}
      >
        Share on Twitter
      </button>
    </div>
    </div>

  );
};

export default DataCard;

