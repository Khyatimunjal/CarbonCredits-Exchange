import { Heading } from "../components/Heading"
import { SubHeading } from "../components/SubHeading"
import { RedButton } from "../components/RedButton"
import { GreenButton } from "../components/GreenButton"
import { useNavigate } from "react-router-dom"

export const JoinUs = () => {
    const navigate = useNavigate();  // Call useNavigate inside the component

    return (
        <div className="bg-slate-300 h-screen flex justify-center">
            <div className="flex flex-col justify-center">
                <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                    <Heading label={"Join Us"}/>
                    <SubHeading label={"Choose your Path to access your account"} />
                    <RedButton onClick={() => navigate("/companysignup")} label={"Register as Company"} />
                    <GreenButton onClick={() => navigate("/projectsignup")} label={"Register as Project"} />
                </div>
            </div>
        </div>
    )
}

