package clicontext

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSplitPaths(t *testing.T) {
	cliContextPaths := "path1,path2, path3"
	paths := SplitPaths(cliContextPaths)
	assert.Equal(t, 3, len(paths))
	assert.Equal(t, []string{"path1", "path2", "path3"}, paths)
}
