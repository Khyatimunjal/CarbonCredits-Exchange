import { Appbar } from "../components/Appbar";
import { Companies } from "../components/Companies";
import { Projects } from "../components/Projects";
import { Balance } from "../components/Balance";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const Dashboard = () => {
    const [updateFlag, setUpdateFlag] = useState(0);
    const location = useLocation();

    useEffect(() => {
        // Trigger data refresh when the location changes
        setUpdateFlag(prev => prev + 1); // Update the flag to trigger re-render
    }, [location]);

    return (
        <div>
            <Appbar />
            <div className="m-8">
                <Balance key={updateFlag} />
                <div className="flex flex-row space-x-8">
                    <div className="w-1/2 h-[calc(100vh-200px)] overflow-y-auto">
                        <Companies key={updateFlag} />
                    </div>
                    <div className="w-1/2 h-[calc(100vh-200px)] overflow-y-auto">
                        <Projects key={updateFlag} />
                    </div>
                </div>
            </div>
        </div>
    );
}
