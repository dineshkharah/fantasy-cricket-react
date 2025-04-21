import React, { useState, useEffect } from "react";
import axios from "../utils/axios";

const Players = () => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await axios.get("/api/v1/players");
                setPlayers(response.data);
            } catch (error) {
                console.error("Error fetching players:", error);
            }
        };

        fetchPlayers();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Players List</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Team</th>
                        <th className="border p-2">Role</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Type</th>
                        <th className="border p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player) => (
                        <tr key={player._id} className="text-center">
                            <td className="border p-2">{player.name}</td>
                            <td className="border p-2">{player.team}</td>
                            <td className="border p-2">{player.role}</td>
                            <td className="border p-2">{player.price}</td>
                            <td className="border p-2">{player.type}</td>
                            <td className="border p-2">{player.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Players;
