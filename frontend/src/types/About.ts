

export interface GitHubInfo {
	repository: string;
	hasWebhooks: boolean;
	webhookURL?: string;
}

export interface About {
	currentVersion: string;
    latestVersion: string;
    shouldUpdate: string;
	githubRepo: GitHubInfo;
}