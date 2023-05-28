import React, { useState, useEffect } from 'react';

interface InputFormProps {
  onSubmit: (teamId: number) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    // Get the teamId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const teamIdFromUrl = urlParams.get('teamId');
    if (teamIdFromUrl) {
      setTeamId(teamIdFromUrl);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d+$/.test(teamId)) {
      onSubmit(parseInt(teamId, 10));
    }
  };

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          placeholder="Enter your team ID"
          className="bg-white rounded-l-xl text-black font-medium px-4 py-3 sm:mt-10 mt-8 hover:bg-gray-100 border border-r-0"
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-3 sm:mt-10 mt-8 rounded-r-xl border border-l-0 hover:bg-gray-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default InputForm;



