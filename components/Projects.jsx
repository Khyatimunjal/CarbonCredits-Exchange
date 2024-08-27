import { useEffect, useState } from "react";
import { Button } from "./Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Projects = ({ updateFlag }) => {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch data when updateFlag changes
        axios.get("http://localhost:3000/api/v1/project/bulk?filter=" + filter)
            .then(response => {
                setProjects(response.data.projects);
            })
            .catch(error => {
                console.error("Error fetching projects:", error);
            });
    }, [filter, updateFlag]);

    return (
        <>
            <div className="font-bold mt-6 text-lg">Projects</div>
            <div className="my-2">
                <input
                    onChange={(e) => setFilter(e.target.value)}
                    type="text"
                    placeholder="Search projects..."
                    className="w-full px-2 py-1 border rounded border-slate-200"
                />
            </div>
            <div>
                {projects.map(project => (
                    <Project key={project._id} project={project} />
                ))}
            </div>
        </>
    );
}

function Project({ project }) {
    const navigate = useNavigate();
    const creditColor = project.carbonCredits >= 0 ? "text-green-600" : "text-red-600";

    return (
        <div className="flex justify-between items-center my-2">
            <div className="flex items-center">
                <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mr-2">
                    <div className="flex flex-col justify-center h-full text-xl">
                        {project.projectName[0]}
                    </div>
                </div>
                <div>
                    <div>{project.projectName}</div>
                    <div className={`text-sm ${creditColor}`}>
                        Carbon Credits: {project.carbonCredits.toLocaleString()}
                    </div>
                </div>
            </div>
            <div>
                <Button
                    onClick={() => {
                        navigate(`/buycredits?projectId=${project._id}&projectName=${project.projectName}`);
                    }}
                    label={"Purchase Credits"}
                />
            </div>
        </div>
    );
}
