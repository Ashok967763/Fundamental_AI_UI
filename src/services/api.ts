import { Config, ConfigDetail, Run, PerformanceData, DashboardOverview } from '../types';

const API_BASE_URL = 'https://aa58a29e3c90.ngrok-free.app/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private async request<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<T> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'API request failed');
      }
      
      return result.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Config endpoints
  async getConfigs(): Promise<Config[]> {
    return this.request<Config[]>('/configs');
  }

  async getConfigById(id: string): Promise<Config> {
    return this.request<Config>(`/configs/${id}`);
  }

  async getConfigRuns(id: string): Promise<Run[]> {
    return this.request<Run[]>(`/configs/${id}/runs`);
  }

  // Run endpoints
  async getRuns(): Promise<Run[]> {
    return this.request<Run[]>('/runs');
  }

  async getRunById(id: string): Promise<Run> {
    return this.request<Run>(`/runs/${id}`);
  }

  // Dashboard endpoints
  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/dashboard/overview');
  }

  async getConfigPerformance(id: string): Promise<PerformanceData[]> {
    return this.request<PerformanceData[]>(`/dashboard/configs/${id}/performance`);
  }

  async getRecentRuns(id: string): Promise<{ config_name: string; runs: Run[] }> {
    return this.request<{ config_name: string; runs: Run[] }>(`/dashboard/configs/${id}/recent-runs`);
  }

  // Helper method to get full config detail
 // Helper method to get full config detail
async getConfigDetail(id: string): Promise<ConfigDetail> {
  const [performanceData, recentRunsResponse] = await Promise.all([
    this.getConfigPerformance(id),
    this.getRecentRuns(id)
  ]);

  return {
    id,
    name: recentRunsResponse.config_name, // Use real config name from API
    performance_data: performanceData,
    recent_runs: recentRunsResponse.runs // Use the runs array from the response
  };
}
}

export const apiClient = new ApiClient();
export default apiClient;

