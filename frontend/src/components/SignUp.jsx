import React, { useState } from 'react';
import { UserPlus } from 'lucide-react'; // Removed 'Icon' as it was causing a potential conflict
import { BUTTONCLASSES, FIELDS, Inputwrapper, MESSAGE_ERROR, MESSAGE_SUCCESS } from '../assets/dummy';
import axios from 'axios';

const API_URL = "http://localhost:https://taskflow-vbfj.onrender.com";
const INITIAL_FORM = { name: "", email: "", password: "" };

// FIX: Destructure 'onSwitchMode' from the props object
const SignUp = ({ onSwitchMode }) => {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: "", type: "" }); // Clear previous messages

        try {
            const { data } = await axios.post(`${API_URL}/api/user/register`, formData);

            console.log("Signup successful", data);
            setMessage({ text: "Registration successful! You can login now.", type: "success" });
            setFormData(INITIAL_FORM); // Reset form fields
            // Optionally, you might want to automatically switch to login after successful signup:
            // if (onSwitchMode) onSwitchMode();

        } catch (err) {
            console.error("Signup error", err);
            // Display error message from backend or a generic one
            setMessage({ text: err.response?.data?.message || "An error occurred, please try again.", type: "error" });
        } finally {
            setLoading(false); // Always stop loading, regardless of success or failure
        }
    };

    return (
        // Added padding and rounded corners for better visual consistency
        <div className='max-w-md w-full bg-white shadow-lg border border-purple-100 p-6 rounded-xl'>
            <div className='mb-6 text-center'>
                <div className='w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4'>
                    <UserPlus className='w-8 h-8 text-white' />
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>Create Account</h2>
                <p className='text-gray-500 text-sm mt-1'>Join TaskFlow to manage your tasks</p>
            </div>

            {/* Display messages based on API response */}
            {message.text && (
                <div className={message.type === 'success' ? MESSAGE_SUCCESS : MESSAGE_ERROR}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
                {/* Iterate over FIELDS to render input elements */}
                {FIELDS.map(({ name, type, placeholder, icon: IconComponent }) => ( // Renamed 'icon:Icon' to 'icon:IconComponent' for clarity
                    <div key={name} className={Inputwrapper}>
                        <IconComponent className='text-purple-500 w-5 h-5 mr-2' />
                        <input
                            type={type}
                            placeholder={placeholder}
                            value={formData[name]}
                            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                            className='w-full focus:outline-none text-sm text-gray-700'
                            required // Ensure inputs are required
                        />
                    </div>
                ))}
                <button type='submit' className={BUTTONCLASSES} disabled={loading}>
                    {loading ? "Signing Up..." : <><UserPlus className='w-4 h-4' /> Sign Up</>}
                </button>
            </form>

            <p className='text-center text-sm text-gray-600 mt-6'>
                Already have an account?{' '}
                {/* Now 'onSwitchMode' is correctly defined as a prop */}
                <button
                    onClick={onSwitchMode}
                    className='text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors'
                >
                    Login
                </button>
            </p>
        </div>
    );
};

export default SignUp;
