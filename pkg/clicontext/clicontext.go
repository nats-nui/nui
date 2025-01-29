package clicontext

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/nats-nui/nui/pkg/logging"
	"os"
	"strings"
)

var (
	PathImportError = errors.New("Importing NATS CLI context failed")
)

type CliConnectionContext struct {
	Description          string `json:"description"`
	URL                  string `json:"url"`
	SocksProxy           string `json:"socks_proxy"`
	Token                string `json:"token"`
	User                 string `json:"user"`
	Password             string `json:"password"`
	Creds                string `json:"creds"`
	NKey                 string `json:"nkey"`
	Cert                 string `json:"cert"`
	Key                  string `json:"key"`
	CA                   string `json:"ca"`
	NSC                  string `json:"nsc"`
	JetStreamDomain      string `json:"jetstream_domain"`
	JetStreamAPIPrefix   string `json:"jetstream_api_prefix"`
	JetStreamEventPrefix string `json:"jetstream_event_prefix"`
	InboxPrefix          string `json:"inbox_prefix"`
	UserJWT              string `json:"user_jwt"`
	ColorScheme          string `json:"color_scheme"`
	TLSFirst             bool   `json:"tls_first"`
}

type Importer[T any] interface {
	Import(uri string) ([]T, error)
}

type CliImporter struct {
	l    logging.Slogger
	path string
}

type ImportedContextEntry struct {
	Name            string               `json:"name"`
	Path            string               `json:"path"`
	ImportedContext CliConnectionContext `json:"imported_context"`
	Error           error                `json:"error"`
}

func SanitizePaths(paths string) []string {
	if paths == "" {
		return []string{}
	}
	return strings.Split(strings.ReplaceAll(paths, " ", ""), ",")
}

func NewImporter(l logging.Slogger) *CliImporter {
	return &CliImporter{
		l: l,
	}
}

func (i *CliImporter) Import(uri string) ([]ImportedContextEntry, error) {
	i.path = uri
	i.l.Info("searching NATS contexts in " + i.path)
	filePaths, err := i.findContextFiles(i.path)
	if err != nil {
		return nil, fmt.Errorf("%v: %w", PathImportError, err)
	}
	var contexts []ImportedContextEntry
	i.l.Info("parsing context files")
	for _, filePath := range filePaths {
		contexts = append(contexts, i.parseContextJson(filePath))
	}
	return contexts, nil
}

func (i *CliImporter) findContextFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var jsonEntries []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".json") {
			jsonEntries = append(jsonEntries, dir+string(os.PathSeparator)+entry.Name())
			i.l.Info("added context file: " + entry.Name())
		}
	}
	return jsonEntries, err
}

func (i *CliImporter) parseContextJson(filePath string) ImportedContextEntry {
	nameFromPath := strings.TrimSuffix(strings.TrimPrefix(filePath, i.path+string(os.PathSeparator)), ".json")
	importedContext := ImportedContextEntry{Name: nameFromPath, Path: filePath}
	data, err := os.ReadFile(filePath)
	if err != nil {
		importedContext.Error = err
		return importedContext
	}
	connContext := CliConnectionContext{}
	err = json.Unmarshal(data, &connContext)
	if err != nil {
		importedContext.Error = err
		return importedContext
	}
	importedContext.ImportedContext = connContext
	return importedContext
}
