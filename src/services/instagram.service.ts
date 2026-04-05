

import axios, { AxiosInstance } from "axios";

export class InstagramService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "https://graph.instagram.com",
      timeout: 10000,
    });
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
    appId: string,
    appSecret: string,
  ): Promise<{ access_token: string; user_id: string }> {
    const response = await this.client.post("/oauth/access_token", {
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    return response.data;
  }

  async getUserProfile(accessToken: string) {
    const response = await this.client.get("/me", {
      params: {
        fields: "id,username,account_type,media_count",
        access_token: accessToken,
      },
    });

    return response.data;
  }

  async refreshToken(longLivedToken: string): Promise<{ access_token: string; expires_in: number }> {
    const response = await this.client.get("/refresh_access_token", {
      params: {
        grant_type: "ig_refresh_token",
        access_token: longLivedToken,
      },
    });

    return response.data;
  }

  async getUserMedia(
    accessToken: string,
    fields: string = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
    limit: number = 25,
  ) {
    const response = await this.client.get("/me/media", {
      params: {
        fields,
        access_token: accessToken,
        limit,
      },
    });

    return response.data;
  }

  async getMediaInsights(
    mediaId: string,
    accessToken: string,
  ) {
    const response = await this.client.get(`/${mediaId}/insights`, {
      params: {
        metric: "impressions,reach,engagement,saved,likes,comments,shares,video_views",
        access_token: accessToken,
      },
    });

    return response.data;
  }

  async getSingleMedia(
    mediaId: string,
    accessToken: string,
    fields: string = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,video_views",
  ) {
    const response = await this.client.get(`/${mediaId}`, {
      params: {
        fields,
        access_token: accessToken,
      },
    });

    return response.data;
  }

  async getUserReels(
    accessToken: string,
    fields: string = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,video_views",
    limit: number = 25,
  ) {
    const response = await this.client.get("/me/media", {
      params: {
        fields,
        access_token: accessToken,
        limit,
      },
    });

    return response.data;
  }

  async validateToken(accessToken: string): Promise<{ user_id: string }> {
    const response = await this.client.get("/me", {
      params: {
        fields: "id",
        access_token: accessToken,
      },
    });

    return response.data;
  }
}