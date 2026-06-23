export interface GoogleCredentialResponse {
  credential: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
}

export interface GoogleTokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
  callback: (resp: GoogleTokenResponse) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: GoogleCredentialResponse) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; text?: string; shape?: string }
          ) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: GoogleTokenResponse) => void;
          }) => GoogleTokenClient;
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}
