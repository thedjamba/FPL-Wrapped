from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import urllib.request
import pandas as pd


my_id = 2103023


def most_captained_player(team_id):
    api_url_base = "https://fantasy.premierleague.com/api/entry/"
    team_url = api_url_base + str(team_id) + "/history/"
    json_object = urllib.request.urlopen(team_url)
    data = json.load(json_object)
    gameweeks = len(data['current'])
    captain_counts = {}
    captain_points = {}

    for i in range(1, gameweeks + 1):
        picks_url = api_url_base + str(team_id) + "/event/" + str(i) + "/picks/"
        json_object = urllib.request.urlopen(picks_url)
        picks_data = json.load(json_object)
        captain_id = [pick["element"] for pick in picks_data["picks"] if pick["is_captain"]][0]

        if captain_id in captain_counts:
            captain_counts[captain_id] += 1
        else:
            captain_counts[captain_id] = 1

        if captain_id in captain_points:
            captain_points[captain_id] += picks_data["entry_history"]["points"] - picks_data["entry_history"]["points_on_bench"]
        else:
            captain_points[captain_id] = picks_data["entry_history"]["points"] - picks_data["entry_history"]["points_on_bench"]

    most_captained_id = max(captain_counts, key=captain_counts.get)

    players_url = "https://fantasy.premierleague.com/api/bootstrap-static/"

    json_object = urllib.request.urlopen(players_url)
    players_data = json.load(json_object)
    most_captained_player = [player for player in players_data["elements"] if player["id"] == most_captained_id][0]
    player_photo_url = "https://resources.premierleague.com/premierleague/photos/players/110x140/p" + most_captained_player["photo"]

    return {
        "player_name": most_captained_player["web_name"],
        "times_captained": captain_counts[most_captained_id],
        "captain_points": captain_points[most_captained_id],
        "photo_url": player_photo_url
    }



def total_bench_points(team_id):
    api_url_base = "https://fantasy.premierleague.com/api/entry/"
    team_url = api_url_base + str(team_id) + "/history/"
    json_object = urllib.request.urlopen(team_url)
    data = json.load(json_object)
    gameweeks = len(data['current'])
    total_points_on_bench = 0


    for i in range(1, gameweeks + 1):
        picks_url = api_url_base + str(team_id) + "/event/" + str(i) + "/picks/"
        json_object = urllib.request.urlopen(picks_url)
        picks_data = json.load(json_object)
        points_on_bench = picks_data["entry_history"]["points_on_bench"]
        total_points_on_bench += points_on_bench


    return total_points_on_bench

def get_team_name_and_total_points(team_id):
    api_url_base = "https://fantasy.premierleague.com/api/entry/"
    team_url = api_url_base + str(team_id) + "/"
    json_object = urllib.request.urlopen(team_url)
    data = json.load(json_object)

    team_name = data['name']
    total_points = data['summary_overall_points']
    summary_overall_rank = data['summary_overall_rank']

    return team_name, total_points, summary_overall_rank


def get_highest_and_lowest_scoring_gameweeks(team_id):
    api_url_base = "https://fantasy.premierleague.com/api/entry/"
    team_url = api_url_base + str(team_id) + "/history/"
    json_object = urllib.request.urlopen(team_url)
    data = json.load(json_object)
    gameweeks = data['current']
    highest_scoring_gameweek = max(gameweeks, key=lambda x: x['points'])

    # Filter out gameweeks with 0 points
    gameweeks_with_points = [gw for gw in gameweeks if gw['points'] > 0]
    lowest_scoring_gameweek = min(gameweeks_with_points, key=lambda x: x['points'])

    return {
        "highest": {
            "gameweek": highest_scoring_gameweek['event'],
            "points": highest_scoring_gameweek['points']
        },
        "lowest": {
            "gameweek": lowest_scoring_gameweek['event'],
            "points": lowest_scoring_gameweek['points']
        }
    }



def get_increasing_and_decreasing_rank_streaks(team_id):
    api_url_base = "https://fantasy.premierleague.com/api/entry/"
    team_url = api_url_base + str(team_id) + "/history/"
    json_object = urllib.request.urlopen(team_url)
    data = json.load(json_object)
    gameweeks = data['current']

    increasing_streak = 0
    decreasing_streak = 0
    max_increasing_streak = 0
    max_decreasing_streak = 0
    first_increasing_gw = 0
    last_increasing_gw = 0
    first_increasing_rank = 0
    last_increasing_rank = 0
    first_decreasing_gw = 0
    last_decreasing_gw = 0
    first_decreasing_rank = 0
    last_decreasing_rank = 0

    for i in range(len(gameweeks) - 1):
        current_rank = gameweeks[i]['overall_rank']
        next_rank = gameweeks[i + 1]['overall_rank']

        if next_rank < current_rank:
            increasing_streak += 1
            decreasing_streak = 0

            if increasing_streak > max_increasing_streak:
                max_increasing_streak = increasing_streak
                first_increasing_gw = gameweeks[i - increasing_streak + 1]['event']
                last_increasing_gw = gameweeks[i + 1]['event']
                first_increasing_rank = gameweeks[i - increasing_streak + 1]['overall_rank']
                last_increasing_rank = gameweeks[i + 1]['overall_rank']
        else:
            decreasing_streak += 1
            increasing_streak = 0

            if decreasing_streak > max_decreasing_streak:
                max_decreasing_streak = decreasing_streak
                first_decreasing_gw = gameweeks[i - decreasing_streak + 1]['event']
                last_decreasing_gw = gameweeks[i + 1]['event']
                first_decreasing_rank = gameweeks[i - decreasing_streak + 1]['overall_rank']
                last_decreasing_rank = gameweeks[i + 1]['overall_rank']

    return {
        "increasing_streak": {
            "gameweeks": max_increasing_streak,
            "first_gameweek": first_increasing_gw,
            "last_gameweek": last_increasing_gw,
            "first_overall_rank": first_increasing_rank,
            "last_overall_rank": last_increasing_rank
        },
        "decreasing_streak": {
            "gameweeks": max_decreasing_streak,
            "first_gameweek": first_decreasing_gw,
            "last_gameweek": last_decreasing_gw,
            "first_overall_rank": first_decreasing_rank,
            "last_overall_rank": last_decreasing_rank
        }
    }


def get_total_transfers_and_most_transfers_gameweek(team_id):
    api_url_base = "https://fantasy.premierleague.com/api/entry/"
    team_url = api_url_base + str(team_id) + "/history/"
    json_object = urllib.request.urlopen(team_url)
    data = json.load(json_object)
    gameweeks = data['current']

    total_transfers = 0
    most_transfers_gameweek = 0
    most_transfers = 0
    transfer_cost = 0

    for gw in gameweeks:
        transfers = gw['event_transfers']
        total_transfers += transfers
        transfer_cost += gw['event_transfers_cost']

        if transfers > most_transfers:
            most_transfers = transfers
            most_transfers_gameweek = gw['event']

    return {
        "total_transfers": total_transfers,
        "most_transfers_gameweek": most_transfers_gameweek,
        "most_transfers": most_transfers,
        "transfer_cost": transfer_cost
    }


def get_most_common_players(team_id):
    api_url_base = "https://fantasy.premierleague.com/api/entry/"
    team_url = api_url_base + str(team_id) + "/history/"
    json_object = urllib.request.urlopen(team_url)
    data = json.load(json_object)
    gameweeks = len(data['current'])

    player_counts = {}

    for i in range(1, gameweeks + 1):
        picks_url = api_url_base + str(team_id) + "/event/" + str(i) + "/picks/"
        json_object = urllib.request.urlopen(picks_url)
        picks_data = json.load(json_object)

        for pick in picks_data["picks"]:
            player_id = pick["element"]

            if player_id in player_counts:
                player_counts[player_id] += 1
            else:
                player_counts[player_id] = 1

    max_gameweeks = max(player_counts.values())

    most_common_player_ids = [player_id for player_id, count in player_counts.items() if count == max_gameweeks]

    players_url = "https://fantasy.premierleague.com/api/bootstrap-static/"
    json_object = urllib.request.urlopen(players_url)
    players_data = json.load(json_object)

    most_common_players = [
        {
            "player_name": player["web_name"],
            "gameweeks": max_gameweeks,
            "total_points": player["total_points"],
            "photo_url": "https://resources.premierleague.com/premierleague/photos/players/250x250/p" + player["photo"]
        }
        for player in players_data["elements"] if player["id"] in most_common_player_ids
    ]

    return most_common_players



import urllib.request
import json

def get_hypothetical_points_with_best_captain(team_id):
    api_url_base = "https://fantasy.premierleague.com/api/entry/"
    team_url = api_url_base + str(team_id) + "/history/"
    json_object = urllib.request.urlopen(team_url)
    data = json.load(json_object)
    gameweeks = len(data['current'])

    players_url = "https://fantasy.premierleague.com/api/bootstrap-static/"
    json_object = urllib.request.urlopen(players_url)
    players_data = json.load(json_object)

    # Create a cache for player data
    player_data_cache = {}

    total_points_difference = 0

    for i in range(1, gameweeks + 1):
        picks_url = api_url_base + str(team_id) + "/event/" + str(i) + "/picks/"
        json_object = urllib.request.urlopen(picks_url)
        picks_data = json.load(json_object)

        captain_id = [pick["element"] for pick in picks_data["picks"] if pick["is_captain"]][0]

        max_points = 0
        best_player_id = None

        for pick in picks_data["picks"]:
            player_id = pick["element"]

            # Check if player data is already in cache
            if player_id not in player_data_cache:
                player_url = "https://fantasy.premierleague.com/api/element-summary/{}/".format(player_id)
                json_object = urllib.request.urlopen(player_url)
                player_data_cache[player_id] = json.load(json_object)

            player_data = player_data_cache[player_id]

            for performance in player_data["history"]:
                if performance["round"] == i:
                    points = performance["total_points"]
                    if points > max_points:
                        max_points = points
                        best_player_id = player_id
                    break

        if captain_id != best_player_id:
            captain_points = 0

            # Use cached player data
            captain_data = player_data_cache[captain_id]

            for performance in captain_data["history"]:
                if performance["round"] == i:
                    captain_points = performance["total_points"]
                    break

            points_difference = (max_points - captain_points)
            total_points_difference += points_difference

    return total_points_difference


def get_originality_scores(team_id):
    api_url_base = "https://fantasy.premierleague.com/api/entry/"
    team_url = api_url_base + str(team_id) + "/history/"
    json_object = urllib.request.urlopen(team_url)
    data = json.load(json_object)
    gameweeks = len(data['current'])

    players_url = "https://fantasy.premierleague.com/api/bootstrap-static/"
    json_object = urllib.request.urlopen(players_url)
    players_data = json.load(json_object)
    elements = players_data["elements"]

    originality_scores = []

    for i in range(1, gameweeks + 1):
        picks_url = api_url_base + str(team_id) + "/event/" + str(i) + "/picks/"
        json_object = urllib.request.urlopen(picks_url)
        picks_data = json.load(json_object)
        player_ids = [pick["element"] for pick in picks_data["picks"]]

        numerator = sum([float(player["selected_by_percent"]) for player in elements if player["id"] in player_ids])

        top_elements = {
            "GK": sorted([player for player in elements if player["element_type"] == 1], key=lambda x: -float(x['selected_by_percent']))[:2],
            "DEF": sorted([player for player in elements if player["element_type"] == 2], key=lambda x: -float(x['selected_by_percent']))[:5],
            "MID": sorted([player for player in elements if player["element_type"] == 3], key=lambda x: -float(x['selected_by_percent']))[:5],
            "FWD": sorted([player for player in elements if player["element_type"] == 4], key=lambda x: -float(x['selected_by_percent']))[:3],
        }

        denominator = sum([float(player["selected_by_percent"]) for sublist in top_elements.values() for player in sublist])

        originality_score = numerator / denominator if denominator != 0 else 0
        originality_scores.append({"gameweek": i, "originality_score": originality_score})

    return originality_scores




app = Flask(__name__, static_folder=".", template_folder=".")
CORS(app)

@app.route('/api/most_captained', methods=['GET'])
def most_captained():
    team_id = request.args.get('team_id', default=my_id, type=int)
    player_name = most_captained_player(team_id)
    return jsonify(player_name)

@app.route('/api/total_bench_points', methods=['GET'])
def total_bench():
    team_id = request.args.get('team_id', default=my_id, type=int)
    total_points = total_bench_points(team_id)
    return jsonify({'total_bench_points': total_points})

@app.route('/api/team_name_and_total_points', methods=['GET'])
def team_name_and_total_points_route():
    team_id = request.args.get('team_id', default=my_id, type=int)
    team_name, total_points, summary_overall_rank = get_team_name_and_total_points(team_id)
    return jsonify({
        'team_name': team_name,
        'total_points': total_points,
        'summary_overall_rank': summary_overall_rank
    })


@app.route('/api/highest_and_lowest_scoring_gameweeks', methods=['GET'])
def highest_and_lowest_scoring_gameweeks():
    team_id = request.args.get('team_id', default=my_id, type=int)
    data = get_highest_and_lowest_scoring_gameweeks(team_id)
    return jsonify(data)

@app.route('/api/increasing_and_decreasing_rank_streaks', methods=['GET'])
def increasing_and_decreasing_rank_streaks():
    team_id = request.args.get('team_id', default=my_id, type=int)
    data = get_increasing_and_decreasing_rank_streaks(team_id)
    return jsonify(data)

@app.route('/api/hypothetical_points', methods=['GET'])
def get_hypothetical_points():
    team_id = request.args.get('team_id', default=None, type=str)

    if not team_id:
        return jsonify({"error": "Please provide a valid team_id"}), 400

    try:
        points_difference = get_hypothetical_points_with_best_captain(team_id)
    except Exception as e:
        return jsonify({"error": "An error occurred while fetching the data"}), 500

    result = {
        "hypothetical_points_difference": points_difference
    }
    return jsonify(result)

@app.route('/api/most_common_players', methods=['GET'])
def most_common_players_route():
    team_id = request.args.get('team_id', default=my_id, type=int)
    most_common_players = get_most_common_players(team_id)
    return jsonify({'most_common_players': most_common_players})

@app.route('/api/originality_scores', methods=['GET'])
def originality_scores_route():
    team_id = request.args.get('team_id', default=my_id, type=int)
    originality_scores = get_originality_scores(team_id)
    return jsonify(originality_scores)

if __name__ == '__main__':
    app.run(debug=True)


# http://127.0.0.1:5000/api/team_name_and_total_points?team_id=2103023
# http://127.0.0.1:5000/api/most_captained?team_id=2103023
    # http://127.0.0.1:5000/api/hypothetical_points?team_id=2103023
# http://127.0.0.1:5000/api/total_bench_points?team_id=2103023
# http://127.0.0.1:5000/api/highest_and_lowest_scoring_gameweeks?team_id=2103023
# http://127.0.0.1:5000/api/increasing_and_decreasing_rank_streaks?team_id=2103023
# http://127.0.0.1:5000/api/most_common_players?team_id=2103023

#     api_url_base = "https://fantasy.premierleague.com/api/entry/"