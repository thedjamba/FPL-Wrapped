// src/App.tsx

import React, { useState, useEffect, useRef } from 'react';
import InputForm from './components/InputForm';
import DataCard from './components/DataCard';
import Footer from "./components/Footer";
import Header from "./components/Header";
import SquigglyLines from "./components/SquigglyLines";
import './styles/tailwind.css';

const endpoints = [
  'team_name_and_total_points',
  'most_captained',
  'total_bench_points',
  'highest_and_lowest_scoring_gameweeks',
  'increasing_and_decreasing_rank_streaks',
  'most_common_players',
  'hypothetical_points',
];

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [data, setData] = useState<{ [key: string]: any }>({});
  const [currentCard, setCurrentCard] = useState<number>(0);
  const dataCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (teamId === null) return;

    const fetchData = async (endpoint: string) => {
      try {
        setLoading(true);
        const res = await fetch(`http://127.0.0.1:5000/api/${endpoint}?team_id=${teamId}`);
        const endpointData = await res.json();
        setData((prevData) => ({ ...prevData, [endpoint]: endpointData }));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    

    endpoints.forEach((endpoint) => fetchData(endpoint));
  }, [teamId]);

  useEffect(() => {
    setCurrentCard(0);
  }, [teamId]);

  useEffect(() => {
    if (teamId && dataCardRef.current) {
      dataCardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [teamId]);

  const handleSubmit = (teamId: number) => {
    setTeamId(teamId);
  };

  const handleNext = () => {
    setCurrentCard((prev) => (prev + 1) % endpoints.length);
  };

  const handlePrev = () => {
    setCurrentCard((prev) => (prev - 1 + endpoints.length) % endpoints.length);
  };

  const currentEndpoint = endpoints[currentCard];

  
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const [generatedSubtitle, setGeneratedSubtitle] = useState<string>("");
  const handleTitleAndSubtitle = (title: string, subtitle: string) => {
    setGeneratedTitle(title);
    setGeneratedSubtitle(subtitle);
  };
  


  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen w-full">
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center pt-2 pb-2 px-4 sm:mt-16 mt-6">
        <a href="https://twitter.com/djambov"
          target="_blank"
          rel="noreferrer"
          className="border rounded-2xl py-1 px-4 text-slate-500 text-sm mb-5 hover:scale-105 transition duration-300 ease-in-out">
          Follow <span className="font-semibold">FPL Wrapped</span> on Twitter
        </a>
        <div className="flex flex-col items-center justify-center mt-10 w-full">
        <div>
        <h1 className="mx-auto max-w-2xl font-display text-5xl font-bold tracking-normal text-slate-900 sm:text-6xl">
          Ready for your Fantasy Premier League {" "}
          <span className="relative whitespace-nowrap text-[#3290EE]">
            <SquigglyLines />
            <span className="relative">Wrapped?</span>
          </span>{" "}
        </h1>
        <p className="mx-auto mt-12 max-w-xl text-lg text-slate-700 leading-7">
          Submit your team id below and get ready for your 2022/2023 FPL Wrapped
        </p>
          <InputForm onSubmit={handleSubmit} />
          {teamId && (
            <>
              <div ref={dataCardRef}>
              <DataCard
                    key={currentEndpoint}
                    data={data[currentEndpoint] || {}}
                    endpoint={currentEndpoint}
                    onTitleAndSubtitle={handleTitleAndSubtitle}
/>
                <div className="flex justify-center items-center space-x-4">
                  {currentCard > 0 && (
                    <button onClick={handlePrev} className="bg-black text-white px-4 py-2 rounded">
                      &lt; Prev
                    </button>
                  )}
                  <button onClick={handleNext} className="bg-black text-white px-4 py-2 rounded">
                    Next &gt;
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
    <Footer />
    </div>
  </>
  );
};

export default App;

