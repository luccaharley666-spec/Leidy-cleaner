import axios, { AxiosError } from 'axios';

export function useApi() {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
    withCredentials: true,
  });

  const request = async (config: any) => {
    try {
      const response = await api.request(config);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error.response?.data?.message || error.message;
      }
      throw error;
    }
  };

  return { api, request };
}
