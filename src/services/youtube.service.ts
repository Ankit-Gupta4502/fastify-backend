import axios, { AxiosInstance } from "axios";

export class YouTubeService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "https://www.googleapis.com/youtube/v3",
      timeout: 10000,
    });
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
    clientId: string,
    clientSecret: string,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  }> {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    return response.data;
  }

  async refreshToken(refreshToken: string, clientId: string, clientSecret: string): Promise<{
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  }> {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    });

    return response.data;
  }

  async getChannel(
    accessToken: string,
    fields: string = "id,snippet,statistics,contentDetails",
  ) {
    const response = await this.client.get("/channels", {
      params: {
        part: "snippet,statistics,contentDetails",
        mine: true,
        fields,
        access_token: accessToken,
      },
    });

    return response.data.items?.[0] || null;
  }

  async getVideos(
    accessToken: string,
    playlistId: string,
    maxResults: number = 25,
    fields: string = "items(id,snippet,contentDetails,status,statistics),nextPageToken,pageInfo",
  ) {
    const response = await this.client.get("/playlistItems", {
      params: {
        part: "snippet,contentDetails,status,statistics",
        playlistId,
        maxResults,
        fields,
        access_token: accessToken,
      },
    });

    return response.data;
  }

  async getVideoDetails(
    videoId: string,
    accessToken: string,
    fields: string = "id,snippet,contentDetails,statistics,status",
  ) {
    const response = await this.client.get("/videos", {
      params: {
        part: "snippet,contentDetails,statistics,status",
        id: videoId,
        fields,
        access_token: accessToken,
      },
    });

    return response.data.items?.[0] || null;
  }

  async getVideoInsights(
    videoId: string,
    accessToken: string,
  ) {
    const response = await this.client.get("/videos", {
      params: {
        part: "statistics",
        id: videoId,
        access_token: accessToken,
      },
    });

    return response.data.items?.[0]?.statistics || null;
  }

  async getPlaylists(
    accessToken: string,
    maxResults: number = 25,
    fields: string = "items(id,snippet,contentDetails),nextPageToken,pageInfo",
  ) {
    const response = await this.client.get("/playlists", {
      params: {
        part: "snippet,contentDetails",
        mine: true,
        maxResults,
        fields,
        access_token: accessToken,
      },
    });

    return response.data;
  }

  async getAnalytics(
    accessToken: string,
    channelId: string,
    startDate: string,
    endDate: string,
    metrics: string = "views,likes,subscribersGained,subscribersLost,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,shares,comments",
  ) {
    const response = await this.client.get("/reports", {
      baseURL: "https://youtubeanalytics.googleapis.com/v2",
      params: {
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics,
        access_token: accessToken,
      },
    });

    return response.data;
  }

  async validateToken(accessToken: string): Promise<{ expires_in: number }> {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`,
    );

    return response.data;
  }
}
