import { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { SubHeading } from "../components/SubHeading";
import { useNavigate } from "react-router-dom";

export const BonusCredits = () => {
    const navigate = useNavigate();
    const [esgScore, setEsgScore] = useState(null);
    const [controversyScore, setControversyScore] = useState(null);
    const [currentCarbonCredits, setCurrentCarbonCredits] = useState(null);
    const [newCarbonCredits, setNewCarbonCredits] = useState(null);
    const [message, setMessage] = useState("");
    const [updateCompleted, setUpdateCompleted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch ESG and controversy scores
                const mlDataResponse = await fetch('http://localhost:3000/api/v1/company/mldata');
                if (!mlDataResponse.ok) {
                    throw new Error('Failed to fetch ML data');
                }
                const mlData = await mlDataResponse.json();
                setEsgScore(mlData.esgScore);
                setControversyScore(mlData.controversyScore);

                // Fetch current carbon credits balance
                const balanceResponse = await fetch('http://localhost:3000/api/v1/companyaccount/balance');
                if (!balanceResponse.ok) {
                    throw new Error('Failed to fetch balance');
                }
                const balanceData = await balanceResponse.json();
                setCurrentCarbonCredits(balanceData.carbonCredits);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleBonusCredits = async () => {
        setUpdateCompleted(false); // Reset the update completed state
        const timeoutId = setTimeout(() => {
            if (!updateCompleted) {
                navigate('/dashboard');
            }
        }, 10000);

        try {
            const response = await fetch('http://localhost:3000/api/v1/companyaccount/update-credits', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    esgScore,
                    controversyScore
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update credits');
            }

            const data = await response.json();
            setNewCarbonCredits(data.newCarbonCredits);
            setMessage(data.message);
            setUpdateCompleted(true); // Mark update as completed
            clearTimeout(timeoutId); // Clear the timeout if update completes
            // Set a timeout for 10 seconds before navigating
            setTimeout(() => {
                navigate('/dashboard');
            }, 10000);
        } catch (error) {
            console.error("Error updating credits:", error);
            setMessage("Error updating credits");
            setUpdateCompleted(true); // Mark update as completed even in case of error
            clearTimeout(timeoutId); // Clear the timeout if update completes
        }
    };

    return (
        <div className="bg-slate-300 h-screen flex justify-center">
            <div className="flex flex-col justify-center">
                <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                    <Heading label={"Bonus Credits"} />
                    <SubHeading label={"Click on button to get Bonus Credits"} />
                    <div className="mt-4">
                        <p>ESG Score: 21</p>
                        <p>Controversy Score: 1</p>
                        <p>Current Carbon Credits: {currentCarbonCredits !== null ? currentCarbonCredits : 'Loading...'}</p>
                    </div>
                    <div className="pt-4">
                        <Button onClick={handleBonusCredits} label={"Bonus Credits"} />
                    </div>
                    {newCarbonCredits !== null && (
                        <div className="mt-4">
                            <p>New Carbon Credits: {newCarbonCredits}</p>
                        </div>
                    )}
                    {message && (
                        <div className="mt-4">
                            <p>{message}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
