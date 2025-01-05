package clicontext

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSanitizePaths(t *testing.T) {
	cliContextPaths := "path1,path2, path3"
	paths := SanitizePaths(cliContextPaths)
	assert.Equal(t, 3, len(paths))
	assert.Equal(t, []string{"path1", "path2", "path3"}, paths)

	cliContextPaths = ""
	paths = SanitizePaths(cliContextPaths)
	assert.Equal(t, 0, len(paths))
}
