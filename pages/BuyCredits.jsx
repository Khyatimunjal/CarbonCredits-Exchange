import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import { useState, useEffect } from 'react';
import { Button } from "../components/Button";

export const BuyCredits = () => {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const projectName = searchParams.get("projectName");
    const [carbonCredits, setCarbonCredits] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [loading, setLoading] = useState(false);  // Add loading state
    const creditPrice = 4;
    const navigate = useNavigate();

    useEffect(() => {
        if (carbonCredits > 0) {
            setTotalCost(carbonCredits * creditPrice);
        } else {
            setTotalCost(0);
        }
    }, [carbonCredits]);

    const handlePurchase = () => {
        if (window.confirm("Are you sure you want to initiate this purchase?")) {
            setLoading(true); // Show loading message
            axios.post("http://localhost:3000/api/v1/purchase-credits", {
                carbonCredits,
                projectId
            }, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            })
            .then(response => {
                console.log(response.data.message);
            })
            .catch(error => {
                console.error("There was an error purchasing credits!", error);
            })
            .finally(() => {
                // Ensure this code runs after either success or failure
                setLoading(false);
                alert("Purchase initiated");
                navigate('/dashboard');
            });
        }
    };

    return (
        <div className="flex justify-center h-screen bg-gray-100">
            <div className="h-full flex flex-col justify-center">
                <div className="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white shadow-lg rounded-lg">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h2 className="text-3xl font-bold text-center">Purchase Credits</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                {projectName ? (
                                    <span className="text-2xl text-white">{projectName[0].toUpperCase()}</span>
                                ) : (
                                    <span className="text-2xl text-white">?</span>
                                )}
                            </div>
                            <h3 className="text-2xl font-semibold">{projectName || "Unknown"}</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="carbon-credits">
                                    Carbon Credits
                                </label>
                                <input
                                    onChange={(e) => {
                                        setCarbonCredits(Number(e.target.value));
                                    }}
                                    type="number"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    id="carbon-credits"
                                    placeholder="Enter carbon credits"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Total Cost (in $)
                                </label>
                                <p className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    {totalCost}
                                </p>
                            </div>
                            <Button
                                label="Initiate Purchase"
                                onClick={handlePurchase}
                            />
                            {loading && (
                                <div className="mt-4 text-center text-blue-500">
                                    Transaction in progress...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}