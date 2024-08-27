import { useNavigate } from 'react-router-dom';

export const Appbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        
        navigate('/');
    };

    return (
        <div className="shadow h-14 flex justify-between">
            <div className="flex flex-col justify-center h-full ml-4">
                Carbon Credits Exchange
            </div>
            <div className="flex items-center">
                <button 
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-4"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};