package app

import (
	"context"
	"testing"
	"testing/synctest"
	"time"

	"github.com/nats-nui/nui/internal/nui"
	"github.com/stretchr/testify/require"
)

func TestShutdownWaitsForBackend(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		a, err := NewApp()
		require.NoError(t, err)
		a.start(t.Context(), func(ctx context.Context) {
			<-ctx.Done()
			time.Sleep(time.Second)
		})
		synctest.Wait()
		start := time.Now()
		a.Shutdown()
		require.Equal(t, time.Second, time.Since(start))
	})
}

func TestShutdownBeforeStartup(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		a, err := NewApp()
		require.NoError(t, err)
		a.Shutdown()
		a.start(t.Context(), func(context.Context) {
			t.Error("backend started after shutdown")
		})
	})
}

func TestShutdownDuringInitialization(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		a, err := NewApp()
		require.NoError(t, err)
		release := make(chan struct{})
		defer close(release)
		a.start(t.Context(), func(context.Context) { <-release })
		synctest.Wait()

		start := time.Now()
		a.Shutdown()
		require.Equal(t, nui.ShutdownTimeout, time.Since(start))
	})
}
