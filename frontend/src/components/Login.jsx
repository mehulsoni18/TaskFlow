import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react'; // Added Lock import for the password field icon
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS
import { BUTTON_CLASSES, INPUTWRAPPER } from '../assets/dummy';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const INITIAL_FORM = { email: "", password: "" };

// FIX: Destructure onSubmit and onSwitchMode from props
const Login = ({ onSubmit, onSwitchMode }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [rememberMe, setRememberMe] = useState(false);

    const navigate = useNavigate();
    const url = "http://localhost:4000"; // Corrected to remove trailing slash for clean path joining

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem('userId');

        if (token) {
            (async () => {
                try {
                    const { data } = await axios.get(`${url}/api/user/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (data.success) {
                        // FIX: Ensure onSubmit is a function before calling
                        onSubmit?.({ token, userId, ...data.user });
                        toast.success("Session restored, Redirecting...");
                        navigate('/');
                    } else {
                        localStorage.clear();
                    }
                } catch (err) {
                    console.error("Session restore error:", err); // Log the error for debugging
                    localStorage.clear();
                    toast.error("Session expired or invalid. Please log in again."); // User-friendly message
                }
            })(); // Immediately invoke the async function
        }
    }, [navigate, onSubmit, url]); // Added 'url' to dependency array

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rememberMe) {
            toast.error(`You must enable "Remember me" to login`);
            return;
        }
        setLoading(true);
        toast.dismiss(); // Dismiss any existing toasts

        try {
            const { data } = await axios.post(`${url}/api/user/login`, formData);
            if (!data.token) throw new Error(data.message || 'Login Failed');

            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            // FIX: Ensure onSubmit is a function before calling
            onSubmit?.({ token: data.token, userId: data.user.id, ...data.user });
            toast.success('Login successful! Redirecting...');
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "An unexpected error occurred.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchMode = () => {
        toast.dismiss();
        // FIX: Ensure onSwitchMode is a function before calling
        onSwitchMode?.();
    };

    const fields = [
        {
            name: 'email',
            type: 'email', // Corrected typo ' email' to 'email'
            placeholder: 'Email',
            icon: Mail,
        },
        {
            name: 'password',
            type: showPassword ? 'text' : 'password',
            placeholder: "Password",
            icon: Lock, // Using the imported Lock icon
            isPassword: true,
        }
    ];

    return (
        <div className='max-w-md bg-white w-full shadow-lg border border-purple-100 rounded-xl p-8'>
            <ToastContainer position='top-center' autoClose={3000} hideProgressBar />

            <div className='mb-6 text-center'>
                <div className='w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4'>
                    <LogIn className='w-8 h-8 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>Welcome!</h2>
                <p className='text-gray-500 text-sm mt-1'>Sign in to continue to TaskFlow</p> {/* Corrected typo 'text-sm-mt-1' to 'text-sm mt-1' */}
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
                {fields.map(({ name, type, placeholder, icon: IconComponent, isPassword }) => (
                    <div key={name} className={INPUTWRAPPER}>
                        <IconComponent className='text-purple-500 w-5 h-5 mr-2' /> {/* Added mr-2 for spacing */}
                        <input
                            type={type}
                            placeholder={placeholder}
                            value={formData[name]}
                            // FIX: Corrected typo from 'onChnage' to 'onChange'
                            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                            className='w-full focus:outline-none text-sm text-gray-700'
                            required
                        />

                        {isPassword && (
                            <button
                                type='button'
                                onClick={() => setShowPassword((prev) => !prev)}
                                className='ml-2 text-gray-500 hover:text-purple-500 transition-colors'
                            >
                                {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                            </button>
                        )}
                    </div>
                ))}

                <div className='flex items-center'>
                    <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className='h-4 w-4 text-purple-500 focus:ring-purple-400 border-gray-300 rounded'
                        required // Added required to checkbox as per your logic
                    />
                    <label htmlFor="rememberMe" className='ml-2 block text-sm text-gray-700'>Remember Me</label>
                </div>

                <button type='submit' className={BUTTON_CLASSES} disabled={loading}>
                    {loading ? ('Logging in...') : (
                        <>
                            {/* FIX: Use LogIn icon from lucide-react, not the component name 'Login' */}
                            <LogIn className='w-4 h-4' /> Login
                        </>
                    )}
                </button>
            </form>

            <p className='text-center text-sm text-gray-600 mt-6'>Don't have an account ?{' '}
                <button
                    type='button' // Added type="button" to prevent form submission
                    className='text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors' // Corrected hover:text-shadow-purple-700
                    onClick={handleSwitchMode}
                >
                    Sign Up
                </button>
            </p>
        </div>
    );
};

export default Login;
