import { useState } from "react";
import { BottomWarning } from "../components/ButtonWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

export const ProjectSignup = () => {
    const [projectName, setProjectName] = useState("");
    const [password, setPassword] = useState("");
    const [energyProduced, setEnergyProduced] = useState("");
    const [initialBalance, setInitialBalance] = useState(""); // Added initialBalance state
    const navigate = useNavigate();

    const validateInputs = () => {
        // Add your validation logic here
        if (!projectName || !password || !energyProduced) {
            return "All fields are required.";
        }

        if (isNaN(energyProduced)) {
            return "Energy Produced must be a valid number.";
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
            projectName,
            password,
            energyProduced: Number(energyProduced),
            initialBalance: Number(initialBalance) // Include all required fields
        };

        console.log('Request Data:', requestData); // Log the data being sent

        try {
            const response = await fetch("http://localhost:3000/api/v1/project/register", {
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

            const { token } = await response.json();
            localStorage.setItem("token", token);

            const decodedToken = jwtDecode(token);
            localStorage.setItem("userType", decodedToken.userType);

            navigate("/dashboard"); // Change to your desired path
        } catch (error) {
            console.error('Error during signup:', error);
        }
    };

    return (
        <div className="bg-slate-300 h-screen flex justify-center">
            <div className="flex flex-col justify-center">
                <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                    <Heading label={"Project"} />
                    <SubHeading label={"Enter your information to create an account"} />

                    <InputBox onChange={e => setProjectName(e.target.value)} placeholder="Project" label={"Project Name"} />
                    <InputBox onChange={e => setPassword(e.target.value)} placeholder="" label={"Password"} />
                    <InputBox onChange={e => setEnergyProduced(e.target.value)} placeholder="kWh" label={"Energy Produced"} />
                    <InputBox onChange={e => setInitialBalance(e.target.value)} placeholder="Initial Balance" label={"Initial Balance"} /> {/* Added Initial Balance InputBox */}

                    <div className="pt-4">
                        <Button onClick={handleSignup} label={"Sign up"} />
                    </div>
                    <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/projectsignin"} />
                </div>
            </div>
        </div>
    );
};
