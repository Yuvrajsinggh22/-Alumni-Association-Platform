import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

export const login = (email, password) =>
  API.post("/auth/login", { email, password });

export const register = (data) =>
  API.post("/auth/register", data);

export default API;
