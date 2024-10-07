package clicontext

import (
	"encoding/json"
	"github.com/nats-nui/nui/pkg/logging"
	"os"
	"strings"
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

type Importer struct {
	l    logging.Slogger
	path string
}

func NewImporter(l logging.Slogger, path string) *Importer {
	return &Importer{
		l: l,
	}
}

func (i *Importer) Import() ([]CliConnectionContext, error) {
	files, err := findContextFiles(i.path)
	if err != nil {
		return nil, err
	}
	var contexts []CliConnectionContext
	for _, file := range files {
		cliContext, err := parseContextJson(file)
		if err != nil {
			return nil, err
		}
		contexts = append(contexts, cliContext)
	}
	return contexts, nil
}

func findContextFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	var jsonEntries []string
	if err != nil {
		return nil, err
	}
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".json") {
			jsonEntries = append(jsonEntries, dir+string(os.PathSeparator)+entry.Name())
		}
	}
	return jsonEntries, err
}

func parseContextJson(filePath string) (CliConnectionContext, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return CliConnectionContext{}, err
	}
	var context CliConnectionContext
	err = json.Unmarshal(data, &context)
	if err != nil {
		return CliConnectionContext{}, err
	}
	return context, nil
}
