import { useEffect, useState } from 'react';
import axios from 'axios';

export const Balance = () => {
    const [balance, setBalance] = useState(null);
    const [carbonCredits, setCarbonCredits] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType"); // Adjust based on your setup

        if (!token || !userType) {
            setError("No token or user type found");
            setLoading(false);
            return;
        }

        axios.get("http://localhost:3000/api/v1/company/balance", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            setBalance(response.data.balance);
            setCarbonCredits(response.data.carbonCredits);
        })
        .catch(error => {
            console.error("Error fetching balance:", error);
            setError("Error fetching balance");
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-xl font-semibold">Balance</h2>
            <div className="mt-4">
                <p><strong>Balance:</strong> ${balance}</p>
                <p><strong>Carbon Credits:</strong> {carbonCredits}</p>
            </div>
        </div>
    );
}
