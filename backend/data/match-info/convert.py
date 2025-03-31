import json
import re


def extract_match_details(text):
    match_info = {}

    # Extracting Match Details
    match_info["teams"] = re.findall(r"Match\s*(\w+)\s*vs\s*(\w+)", text)[0]
    match_info["date"] = re.search(r"Date(.*?)Time", text).group(1).strip()
    match_info["time"] = re.search(r"Time(.*?)Venue", text).group(1).strip()
    match_info["venue"] = re.search(r"Venue(.*?)Umpires", text).group(1).strip()
    match_info["umpires"] = re.findall(r"Umpires(.*?)Third Umpire", text)[0].split(", ")
    match_info["third_umpire"] = (
        re.search(r"Third Umpire(.*?)Match Referee", text).group(1).strip()
    )
    match_info["match_referee"] = (
        re.search(r"Match Referee(.*?)Delhi Capitals Squad", text).group(1).strip()
    )

    return match_info


def extract_innings(text):
    innings = []

    innings_data = re.findall(
        r"(.*?) Innings(\d+-\d+) \(.*? Ov\)(.*?)Bowler", text, re.DOTALL
    )
    for team, score, details in innings_data:
        team = team.strip()
        score = score.strip()

        # Extract Batting Stats
        batting = []
        batting_matches = re.findall(
            r"(\w+(?: \w+)*)[cbrun out()]+(.*?)\b(\d+)\b(\d+)\b(\d+)\b(\d+)\b([\d.]+)",
            details,
        )
        for match in batting_matches:
            batter = {
                "name": match[0].strip(),
                "how_out": match[1].strip(),
                "runs": int(match[2]),
                "balls": int(match[3]),
                "fours": int(match[4]),
                "sixes": int(match[5]),
                "strike_rate": float(match[6]),
            }
            batting.append(batter)

        # Extract Bowling Stats
        bowling = []
        bowling_matches = re.findall(
            r"(\w+(?: \w+)*)\b(\d+)\b(\d+)\b(\d+)\b(\d+)\b(\d+)\b([\d.]+)", details
        )
        for match in bowling_matches:
            bowler = {
                "name": match[0].strip(),
                "overs": int(match[1]),
                "maidens": int(match[2]),
                "runs": int(match[3]),
                "wickets": int(match[4]),
                "no_balls": int(match[5]),
                "economy": float(match[6]),
            }
            bowling.append(bowler)

        innings.append(
            {"team": team, "score": score, "batting": batting, "bowling": bowling}
        )

    return innings


def convert_text_to_json(text_file, output_json):
    with open(text_file, "r", encoding="utf-8") as file:
        text_data = file.read()

    json_data = {
        "match_info": extract_match_details(text_data),
        "innings": extract_innings(text_data),
    }

    with open(output_json, "w", encoding="utf-8") as json_file:
        json.dump(json_data, json_file, indent=4)

    print(f"JSON file created: {output_json}")


# Run the function with your text file
convert_text_to_json("matchData2web.txt", "output.json")
