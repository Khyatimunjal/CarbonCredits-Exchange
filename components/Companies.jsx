import { useEffect, useState } from "react";
import axios from "axios";

export const Companies = ({ updateFlag }) => {
    const [companies, setCompanies] = useState([]);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        // Fetch data when updateFlag changes
        axios.get("http://localhost:3000/api/v1/company/bulk?filter=" + filter)
            .then(response => {
                setCompanies(response.data.companies);
            })
            .catch(error => {
                console.error("Error fetching companies:", error);
            });
    }, [filter, updateFlag]);

    return (
        <>
            <div className="font-bold mt-6 text-lg">Companies</div>
            <div className="my-2">
                <input
                    onChange={(e) => setFilter(e.target.value)}
                    type="text"
                    placeholder="Search companies..."
                    className="w-full px-2 py-1 border rounded border-slate-200"
                />
            </div>
            <div>
                {companies.map(company => (
                    <Company key={company._id} company={company} />
                ))}
            </div>
        </>
    );
}

function Company({ company }) {
    const creditColor = "text-red-600";

    return (
        <div className="flex justify-between items-center my-2">
            <div className="flex items-center">
                <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mr-2">
                    <div className="flex flex-col justify-center h-full text-xl">
                        {company.companyName[0]}
                    </div>
                </div>
                <div>
                    <div>{company.companyName}</div>
                    <div className={`text-sm ${creditColor}`}>
                        Carbon Credits: {company.carbonCredits.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
