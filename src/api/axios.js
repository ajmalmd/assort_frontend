import axios from "axios";
import { BASE_URL } from "./apiConfig";

const assort_api = axios.create({
  baseURL: BASE_URL,
});

export default assort_api;
