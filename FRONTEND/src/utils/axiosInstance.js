import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'https://gymfinder-backend-z655.onrender.com/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosInstance;