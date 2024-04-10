package nui

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/Masterminds/semver/v3"
	"github.com/gofiber/fiber/v2"
	"github.com/nats-nui/nui/internal/version"
	"net/http"
)

type About struct {
	CurrentVersion string `json:"current_version"`
	LatestVersion  string `json:"latest_version"`
	ShouldUpdate   bool   `json:"should_update"`
}

func (a *App) handleAbout(c *fiber.Ctx) error {

	current, latest, shouldUpdate, err := checkForUpdates(c.Context())
	if err != nil {
		a.l.Error("error when checking for updates", "error", err.Error())
	}
	return c.JSON(About{
		CurrentVersion: current,
		LatestVersion:  latest,
		ShouldUpdate:   shouldUpdate,
	})
}

func checkForUpdates(ctx context.Context) (string, string, bool, error) {
	current := version.Get()
	latest, err := detectLatest(ctx, "nats-nui/nui")
	if err != nil {
		return current, "", false, err
	}
	shouldUpdate, err := less(current, latest)

	return current, latest, shouldUpdate, err
}

type Release struct {
	TagName string `json:"tag_name"`
}

func detectLatest(ctx context.Context, repoSlug string) (string, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", fmt.Sprintf("https://api.github.com/repos/%s/releases/latest", repoSlug), nil)
	if err != nil {
		return "", err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var release Release
	if err := json.NewDecoder(resp.Body).Decode(&release); err != nil {
		return "", err
	}

	return release.TagName, nil
}

func less(v1, v2 string) (bool, error) {
	sv1, err := semver.NewVersion(v1)
	if err != nil {
		return false, fmt.Errorf("Error parsing version '%s': %s", v1, err)
	}

	sv2, err := semver.NewVersion(v2)
	if err != nil {
		return false, fmt.Errorf("Error parsing version '%s': %s", v2, err)
	}

	return sv1.LessThan(sv2), nil
}
