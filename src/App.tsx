// src/App.tsx

import React, { useState, useEffect, useRef } from 'react';
import InputForm from './components/InputForm';
import DataCard from './components/DataCard';
import Footer from "./components/Footer";
import Header from "./components/Header";
import SquigglyLines from "./components/SquigglyLines";
import LoadingDots from './components/LoadingDots';
import './styles/tailwind.css';

const getQueryParams = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const teamId = queryParams.get('teamId');
  const endpoint = queryParams.get('endpoint');

  return {
    teamId: teamId ? parseInt(teamId) : null,
    endpoint: endpoint || null,
  };
};

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

  const queryParams = getQueryParams();

  useEffect(() => {
    if (queryParams.teamId) {
      setTeamId(queryParams.teamId);
    }
    if (queryParams.endpoint) {
      setCurrentCard(endpoints.indexOf(queryParams.endpoint));
    }
  }, [queryParams]);

  const [loading, setLoading] = useState<boolean>(false);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [data, setData] = useState<{ [key: string]: any }>({});
  const [currentCard, setCurrentCard] = useState<number>(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentEndpoint = endpoints[currentCard];
  const abortControllerRef = useRef<AbortController | null>(null);


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

    // Fetch data for all endpoints
    endpoints.forEach((endpoint) => {
      fetchData(endpoint);
    });
  }, [teamId]);

  useEffect(() => {
    setCurrentCard(0);
  }, [teamId]);

  useEffect(() => {
    if (teamId && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [teamId]);

  const handleSubmit = (teamId: number) => {
    setTeamId(teamId);
    window.history.pushState({}, '', '/');
  };

  const handleNext = () => {
    if (currentCard < endpoints.length - 1) {
      setCurrentCard((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentCard((prev) => (prev - 1 + endpoints.length) % endpoints.length);
  };

  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const [generatedSubtitle, setGeneratedSubtitle] = useState<string>("");
  const handleTitleAndSubtitle = (title: string, subtitle: string) => {
    setGeneratedTitle(title);
    setGeneratedSubtitle(subtitle);
  };
  
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex-grow flex flex-col justify-around items-center text-center px-4 sm:mt-6 mt-6 w-full overflow-y-auto">
          <a href="https://twitter.com/fplwrapped"
            target="_blank"
            rel="noreferrer"
            className="border rounded-2xl py-1 px-4 text-slate-500 text-sm mt-8 mb-4 hover:scale-105 transition duration-300 ease-in-out self-center">
            Follow <span className="font-semibold">FPL Wrapped</span> on Twitter
          </a>
          <div className="flex flex-col items-center justify-center mt-8 w-full">
            <h1 className="mx-auto max-w-2xl font-display text-4xl font-bold tracking-normal text-slate-900 sm:text-6xl">
              Ready for your Fantasy Premier League {" "}
              <span className="relative whitespace-nowrap text-[#3290EE]">
                <SquigglyLines />
                <span className="relative">Wrapped?</span>
              </span>{" "}
            </h1>
            <p className="mx-auto mt-12 max-w-xl text-lg text-slate-700 leading-7">
              Submit your team id below and get ready for your 2022/2023 FPL Wrapped
            </p>
          </div>
          <div className="flex flex-col items-center justify-center mb-16 w-full">
              <InputForm onSubmit={handleSubmit} />
              {!teamId && <div className="h-[4rem]"></div>}
              {teamId && (
                <div ref={bottomRef}>
                  {!data[currentEndpoint] ? (
                    <LoadingDots color="#000" style="small" />
                  ) : (
                    <DataCard
                      key={currentEndpoint}
                      data={data[currentEndpoint] || {}}
                      endpoint={currentEndpoint}
                      onTitleAndSubtitle={handleTitleAndSubtitle}
                      teamId={teamId || 0}
                    />
                  )}

                  <div className="flex justify-center items-center space-x-4">
                    {currentCard > 0 && (
                      <button onClick={handlePrev} className="bg-black text-white px-4 py-2 rounded mb-8" aria-label="Show previous insight">
                        &lt; Prev
                      </button>
                    )}
                    {currentCard < endpoints.length - 1 && (
                      <button
                        onClick={handleNext}
                        className="bg-black text-white px-4 py-2 rounded mb-8"
                        aria-label="Show next insight"
                      >
                        Next &gt;
                      </button>
                    )}
                  </div>
                </div>
              )}
          </div>
        <div 
        ref={bottomRef}>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;

