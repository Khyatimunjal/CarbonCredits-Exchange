import { useState } from "react";
import { BottomWarning } from "../components/ButtonWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import { useNavigate } from "react-router-dom";

export const CompanySignup = () => {
    const [companyName, setCompanyName] = useState("");
    const [password, setPassword] = useState("");
    const [noOfEmployees, setNoOfEmployees] = useState("");
    const [electricityConsumptionPerPerson, setElectricityConsumptionPerPerson] = useState("");
    const [fuelConsumptionPerPerson, setFuelConsumptionPerPerson] = useState("");
    const [transportationKmPerPerson, setTransportationKmPerPerson] = useState("");
    const [esgscore, setEsgscore] = useState("");
    const [controversyscore, setControversyscore] = useState("1");
    const [initialBalance, setInitialBalance] = useState(""); // Added initialBalance state
    const navigate = useNavigate();

    const validateInputs = () => {
        // Add your validation logic here
        if (!companyName || !password || !noOfEmployees || !electricityConsumptionPerPerson || !fuelConsumptionPerPerson || !transportationKmPerPerson || !esgscore || !initialBalance) {
            return "All fields are required.";
        }

        if (isNaN(noOfEmployees) || isNaN(electricityConsumptionPerPerson) || isNaN(fuelConsumptionPerPerson) || isNaN(transportationKmPerPerson) || isNaN(esgscore) || isNaN(initialBalance)) {
            return "Numerical fields must be valid numbers.";
        }

        return null;
    };

    const handleSignup = async () => {
        const validationError = validateInputs();
        if (validationError) {
            console.error('Validation Error:', validationError);
            return;
        }

        const requestData = {
            companyName,
            password,
            noOfEmployees: Number(noOfEmployees),
            electricityConsumptionPerPerson: Number(electricityConsumptionPerPerson),
            fuelConsumptionPerPerson: Number(fuelConsumptionPerPerson),
            transportationKmPerPerson: Number(transportationKmPerPerson),
            esgscore: Number(esgscore),
            controversyscore: Number(controversyscore),
            initialBalance: Number(initialBalance) // Include all required fields
        };

        console.log('Request Data:', requestData); // Log the data being sent

        try {
            const response = await fetch("http://localhost:3000/api/v1/company/register", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response from server:', errorData);
                throw new Error(errorData.message || 'Network response was not ok');
            }

            // Navigate to the next page or display a success message
            navigate("/bonuscredits"); // Change to your desired path
        } catch (error) {
            console.error('Error during signup:', error);
        }
    };

    return (
        <div className="bg-slate-300 h-screen flex justify-center">
            <div className="flex flex-col justify-center">
                <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                    <Heading label={"Company"} />
                    <SubHeading label={"Enter your information to create an account"} />

                    <InputBox onChange={e => setCompanyName(e.target.value)} placeholder="Company" label={"Company Name"} />
                    <InputBox onChange={e => setPassword(e.target.value)} placeholder="" label={"Password"} />
                    <InputBox onChange={e => setNoOfEmployees(e.target.value)} placeholder="" label={"No of Employees"} />
                    <InputBox onChange={e => setElectricityConsumptionPerPerson(e.target.value)} placeholder="KWH" label={"Electricity Consumption Per Person"} />
                    <InputBox onChange={e => setFuelConsumptionPerPerson(e.target.value)} placeholder="Litres" label={"Fuel Consumption Per Person"} />
                    <InputBox onChange={e => setTransportationKmPerPerson(e.target.value)} placeholder="Kms" label={"Transportation Per Person"} />
                    <InputBox onChange={e => setEsgscore(e.target.value)} placeholder="" label={"ESG Score"} />
                    <InputBox onChange={e => setInitialBalance(e.target.value)} placeholder="Initial Balance" label={"Initial Balance"} /> {/* Added Initial Balance InputBox */}

                    <div className="flex flex-col mb-4">
                        <label className="mb-2 text-sm font-medium text-left">Controversy Score</label>
                        <select 
                            value={controversyscore}
                            onChange={e => setControversyscore(e.target.value)}
                            className="p-2 border border-slate-200 rounded-md">
                            {[1, 2, 3, 4, 5].map(score => (
                                <option key={score} value={score}>{score}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleSignup} label={"Sign up"} />
                    </div>
                    <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/companysignin"} />
                </div>
            </div>
        </div>
    );
};
