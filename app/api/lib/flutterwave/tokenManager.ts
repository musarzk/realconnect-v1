import { 
  FLW_CLIENT_ID, 
  FLW_CLIENT_SECRET } from './config';

class TokenManager {
  private token: string | null = null;
  private expiresAt: number = 0;

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }
    await this.refreshToken();
    if (!this.token) {
      throw new Error("Failed to retrieve access token");
    }
    return this.token;
  }

  async refreshToken() {
    try {
      const response = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'client_id': FLW_CLIENT_ID || '',
          'client_secret': FLW_CLIENT_SECRET || '',
          'grant_type': 'client_credentials'
        })
      });

      // Debug logging
      console.log("TokenManager: Refreshing token with Client ID:", FLW_CLIENT_ID ? "Set" : "Missing", "Secret:", FLW_CLIENT_SECRET ? "Set" : "Missing");
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Token refresh failed:", response.status, errorText);
        throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.access_token) {
        this.token = data.access_token;
        // Set expiration time (subtract 60s buffer)
        this.expiresAt = Date.now() + ((data.expires_in || 3600) * 1000) - 60000; 
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }
}

export const tokenManager = new TokenManager();
