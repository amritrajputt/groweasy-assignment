import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const importApi = {
    uploadCsv: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/import", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
    getJobStatus: async (jobId: string) => {
        const response = await api.get(`/import/status/${jobId}`);
        return response.data;
    },
};