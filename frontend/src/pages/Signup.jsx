    import GaintLogo from "../assets/Gaint_logo.png";
    import { Link } from "react-router-dom";

    const Signup = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
            <img src={GaintLogo} alt="Gaint Logo" className="h-14 mx-auto mb-4"/>

            <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

            <form className="space-y-4">
            <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-lg"
            />

            <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
            />

            <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg"
            />

            <select className="w-full px-4 py-2 border rounded-lg">
                <option>Select Role</option>
                <option>Employee</option>
                <option>Manager</option>
                <option>HR</option>
            </select>

            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Sign Up
            </button>
            </form>

            <p className="text-sm text-center mt-4">
            Already have an account?
            <Link to="/login" className="text-blue-600 ml-1 hover:underline">
                Login
            </Link>
            </p>
        </div>
        </div>
    );
    };

    export default Signup;
