// src/components/DataCard.tsx

import React, { useEffect } from 'react';


interface CardProps {
  data: any;
  endpoint: string;
  onTitleAndSubtitle: (title: string, subtitle: string) => void;

}

const getTitleAndSubtitle = (endpoint: string, data: any) => {
  switch (endpoint) {
    case 'team_name_and_total_points':
      return {
        title: `Hey ${data.team_name}`,
        subtitle: `This season you finished on ${data.total_points} which means you are ${data.summary_overall_rank} in the world`,
      };

      case 'most_captained':
        return {
          title: `Captain Original`,
          subtitle: `You captained ${data.player_name.player_name} ${data.player_name.times_captained} times for a total of ${data.player_name.captain_points} points`,
        };

        case 'total_bench_points':
          return {
            title: `Benched`,
            subtitle: `Ouch! You've left ${data.total_bench_points} points on the bench overall`,
          };

          case 'highest_and_lowest_scoring_gameweeks':
            return {
              title: `Highs and lows`,
              subtitle: `${data.lowest.gameweek} was pretty bad with just ${data.lowest.points} points... but you rocked
              ${data.highest.gameweek} with ${data.highest.points}! What a difference!`,
            };

            case 'increasing_and_decreasing_rank_streaks':
              return {
                title: `Talk about form`,
                subtitle: `Between ${data.increasing_streak.first_gameweek} and ${data.increasing_streak.last_gameweek}
                you went from ${data.increasing_streak.first_overall_rank} to ${data.increasing_streak.first_overall_rank}. 
                What a streak!`,
              };

              case 'most_common_players':
                const sortedPlayers = data.most_common_players.sort((a: any, b: any) => b.total_points - a.total_points);
                let subtitle = '';
          
                if (sortedPlayers.length === 1) {
                  subtitle = `You kept ${sortedPlayers[0].player_name} for ${sortedPlayers[0].gameweeks} gameweeks. 
                  He brought you a total of ${sortedPlayers[0].total_points}.`;
                } else {
                  subtitle = `You kept ${sortedPlayers[0].player_name} for ${sortedPlayers[0].gameweeks} gameweeks. You also kept faith in `;
                  sortedPlayers.slice(1).forEach((player: any, index: number) => {
                    subtitle += `${player.player_name}${index < sortedPlayers.length - 2 ? ', ' : ''}`;
                  });
                }

                return {
                  title: 'Season Heroes',
                  subtitle,
                };

                case 'hypothetical_points':
                  return {
                    title: `What if...`,
                    subtitle: `If you always got the right captain, you would've finished with 
                    ${data.hypothetical_points_difference} additional points`,
                  };                

                  default:
      return {
        title: '',
        subtitle: '',
      };
  }
};

const DataCard: React.FC<CardProps> = ({ data, endpoint, onTitleAndSubtitle }) => {
  const { title: generatedTitle, subtitle } = getTitleAndSubtitle(endpoint, data);
  useEffect(() => {
    onTitleAndSubtitle(generatedTitle, subtitle);
  }, [generatedTitle, subtitle, onTitleAndSubtitle]);
  const shareToTwitter = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/${endpoint}`;
    const tweetText = encodeURIComponent(`${generatedTitle}\n\n${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  return (
    <div className="flex justify-center">
    <div className="bg-white shadow rounded-xl mb-4 p-4 w-full sm:w-96">
      <h3 className="text-xl mb-2">{generatedTitle}</h3>
      <p className="text-gray-700 mb-4">{subtitle}</p>
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

