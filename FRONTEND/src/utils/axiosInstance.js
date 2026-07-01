import axios from "axios";

const axiosInstane = axios.create({
    baseURL:'http://localhost:3000/api',
    withCredentials:true,
    headers:{
        'Content-Type':'application/json'
    }
});

export default axiosInstance;