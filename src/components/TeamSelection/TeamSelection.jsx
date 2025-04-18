import React, { useState, useEffect } from "react";
import PlayerCard from "../PlayerSelection/PlayerCard";
import axios from "axios";

const TeamSelection = ({ selectedPlayers,
    setSelectedPlayers,
    selectedPlayerCount,
    setSelectedPlayerCount,
}) => {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [confirmedPlayers, setConfirmedPlayers] = useState([]);
    const [showCaptainModal, setShowCaptainModal] = useState(false);
    const [captainID, setCaptainID] = useState(null);
    const [viceCaptainID, setViceCaptainID] = useState(null);
    const [selectionStep, setSelectionStep] = useState("captain");

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await axios.get("http://localhost:5000/api/v1/teams/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setTeams(res.data);
                if (res.data.length > 0) {
                    setSelectedTeam(res.data[res.data.length - 1]);
                }
            } catch (error) {
                console.error("Error fetching team data:", error);
            }
        };

        fetchTeamData();
    }, []);

    // Load selected players from local storage on initial render
    useEffect(() => {
        if (selectedTeam && selectedTeam.players?.length > 0) {
            // localStorage.setItem("selectedPlayers", JSON.stringify(selectedTeam.players));
            // localStorage.setItem("selectedPlayerCount", selectedTeam.players.length.toString());
        }
    }, [selectedTeam]);


    useEffect(() => {
        if (selectedTeam) {
            setConfirmedPlayers(selectedTeam.players || []);
        }
    }, [selectedTeam]);

    useEffect(() => {
        if (selectedTeam) {
            setCaptainID(selectedTeam.captainID || null);
            setViceCaptainID(selectedTeam.viceCaptainID || null);
        }
    }, [selectedTeam]);

    useEffect(() => {
        if (!selectedTeam || selectedPlayers.length === 0) return;

        // Don't update if team already saved (has _id from DB and captainID)
        if (selectedTeam._id && selectedTeam._id.toString().startsWith("temp") === false && captainID && viceCaptainID) {
            return;
        }

        setConfirmedPlayers((prevConfirmed) => {
            const newSelections = selectedPlayers.filter(
                (player) => !prevConfirmed.some((p) => p._id === player._id)
            );
            return [...prevConfirmed, ...newSelections];
        });
    }, [selectedPlayers, selectedTeam, captainID, viceCaptainID]);


    const handleCreateNewTeam = () => {
        if (teams.length >= 3) return;

        const newTeam = {
            _id: `temp-${Date.now()}`,
            name: `Team ${teams.length + 1}`,
            players: [],
        };

        setTeams([...teams, newTeam]);
        setSelectedTeam(newTeam);
        setConfirmedPlayers([]);
    };

    const handleConfirmTeam = async () => {
        if (confirmedPlayers.length !== 15 || !captainID || !viceCaptainID) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://localhost:5000/api/v1/teams/create",
                {
                    teamName: selectedTeam.name,
                    players: confirmedPlayers,
                    captainID,
                    viceCaptainID,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const newTeam = res.data;
            setTeams(teams.map(team => (team._id === selectedTeam._id ? newTeam : team)));
            setSelectedTeam(newTeam);
            setConfirmedPlayers([]);
            setCaptainID(null);
            setViceCaptainID(null);
        } catch (error) {
            console.error("Error saving team:", error);
        }
    };

    const handlePlayerClickForCaptainVC = (player) => {
        if (selectionStep === "captain") {
            setCaptainID(player.playerID);
            setSelectionStep("viceCaptain");
        } else if (selectionStep === "viceCaptain" && player.playerID !== captainID) {
            setViceCaptainID(player.playerID);
            setShowCaptainModal(false);
            setSelectionStep("captain");
        }
    };

    const getHighlightType = (playerID) => {
        if (playerID === captainID) return "captain";
        if (playerID === viceCaptainID) return "vice-captain";
        return null;
    };

    // Function to handle player removal
    const handleRemovePlayer = (playerIDToRemove) => {
        const updatedPlayers = confirmedPlayers.filter((p) => p.playerID !== playerIDToRemove);
        setConfirmedPlayers(updatedPlayers);

        // If editing the current unsaved team
        if (selectedTeam?._id?.startsWith("temp-")) {
            const newSelected = selectedPlayers.filter((p) => p.playerID !== playerIDToRemove);
            setSelectedPlayers(newSelected);
            setSelectedPlayerCount(newSelected.length);

            localStorage.setItem("selectedPlayers", JSON.stringify(newSelected));
            localStorage.setItem("selectedPlayerCount", newSelected.length.toString());
        }

        if (captainID === playerIDToRemove) setCaptainID(null);
        if (viceCaptainID === playerIDToRemove) setViceCaptainID(null);
    };



    return (
        <div className="flex flex-col w-full p-4 text-white rounded-lg shadow-md overflow-auto">
            <h2 className="text-lg font-semibold mb-4">Select Your Team</h2>

            <div className="flex flex-wrap justify-center gap-4 mb-6">
                {teams.map((team) => (
                    <button
                        key={team._id}
                        className={`px-4 py-2 border rounded-md transition ${selectedTeam?._id === team._id ? "bg-blue-500 text-white" : "bg-gray-700"}`}
                        onClick={() => setSelectedTeam(team)}
                    >
                        {team.name}
                    </button>
                ))}
                {teams.length < 3 && (
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded-md"
                        onClick={handleCreateNewTeam}
                    >
                        + Create New Team
                    </button>
                )}
            </div>

            {confirmedPlayers.length === 15 && !captainID && !viceCaptainID && (
                <button
                    className="w-full py-2 mb-4 rounded-md bg-yellow-500 hover:bg-yellow-600 font-bold"
                    onClick={() => setShowCaptainModal(true)}
                >
                    Select Captain & Vice-Captain
                </button>
            )}

            {confirmedPlayers.length === 15 &&
                captainID &&
                viceCaptainID &&
                selectedTeam &&
                selectedTeam._id?.startsWith("temp-") && // selectedTeam._id to ensure the button only appears when the team has a temporary ID (i.e., starts with 'temp-'), indicating it's not yet saved.
                (
                    <div className="flex gap-4 my-4">
                        <button
                            className="w-1/2 py-2 rounded-md text-white font-bold bg-red-500 hover:bg-red-600"
                            onClick={() => {
                                setCaptainID(null);
                                setViceCaptainID(null);
                            }}
                        >
                            Clear Captain & VC
                        </button>
                        <button
                            className="w-1/2 py-2 rounded-md text-white font-bold bg-green-500 hover:bg-green-600"
                            onClick={handleConfirmTeam}
                        >
                            Confirm Team
                        </button>
                    </div>
                )
            }

            <div className="flex flex-wrap justify-center gap-3 w-full px-4 overflow-y-auto max-h-[80vh]">
                {selectedTeam ? (
                    confirmedPlayers.length > 0 ? (
                        [...confirmedPlayers]
                            .sort((a, b) => {
                                if (a.playerID === captainID) return -1;
                                if (b.playerID === captainID) return 1;
                                if (a.playerID === viceCaptainID) return -1;
                                if (b.playerID === viceCaptainID) return 1;
                                return 0;
                            })
                            .map((player) => (
                                <PlayerCard
                                    key={player._id}
                                    player={player}
                                    highlight={getHighlightType(player.playerID)}
                                    onSelect={() => { }}
                                    {...(selectedTeam._id?.startsWith("temp-") && {
                                        onRemove: () => handleRemovePlayer(player.playerID),
                                        showRemove: true,
                                    })}
                                />
                            ))
                    ) : (
                        <p className="text-gray-400">No players in this team.</p>
                    )
                ) : (
                    <p className="text-gray-400">No teams available.</p>
                )}
            </div>

            {showCaptainModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-white text-lg font-bold mb-4">
                            {selectionStep === "captain" ? "Select Captain" : "Select Vice-Captain"}
                        </h2>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {confirmedPlayers.map((player) => (
                                <PlayerCard
                                    key={player._id}
                                    player={player}
                                    onSelect={() => handlePlayerClickForCaptainVC(player)}
                                    isSelected={false}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedTeam && selectedTeam._id?.startsWith("temp-") && confirmedPlayers.length > 0 && (
                <button
                    className="w-full py-2 mt-4 rounded-md text-white font-bold bg-red-600 hover:bg-red-700"
                    onClick={() => {
                        setConfirmedPlayers([]);
                        setSelectedPlayers([]);
                        setSelectedPlayerCount(0);

                        localStorage.setItem("selectedPlayers", JSON.stringify([]));
                        localStorage.setItem("selectedPlayerCount", "0");

                        setCaptainID(null);
                        setViceCaptainID(null);
                    }}
                >
                    Clear Team
                </button>
            )}



        </div>
    );
};

export default TeamSelection;
