package connection

import (
	"github.com/nats-nui/nui/pkg/clicontext"
	"strings"
)

func parseFromCliContext(name string, cliContext clicontext.CliConnectionContext) Connection {
	var auths []Auth

	if cliContext.User != "" && cliContext.Password != "" {
		auths = append(auths, Auth{
			Mode:     AuthModeUserPassword,
			Username: cliContext.User,
			Password: cliContext.Password,
		})
	}

	if cliContext.Token != "" {
		auths = append(auths, Auth{
			Mode:  AuthModeToken,
			Token: cliContext.Token,
		})
	}

	if cliContext.UserJWT != "" {
		auths = append(auths, Auth{
			Mode: AuthModeJwt,
			Jwt:  cliContext.UserJWT,
		})
	}

	if cliContext.NKey != "" {
		auths = append(auths, Auth{
			Mode:     AuthModeNKey,
			NKeySeed: cliContext.NKey,
		})
	}

	if cliContext.Creds != "" {
		auths = append(auths, Auth{
			Mode:  AuthModeCredsFile,
			Creds: cliContext.Creds,
		})
	}

	var hosts []string
	if cliContext.URL != "" {
		hosts = append(hosts, strings.Split(cliContext.URL, ",")...)
	}
	return Connection{
		Name:        name,
		Hosts:       hosts,
		InboxPrefix: cliContext.InboxPrefix,
		Auth:        auths,
		TLSAuth: TLSAuth{
			Enabled:  cliContext.Cert != "" && cliContext.Key != "",
			CertPath: cliContext.Cert,
			KeyPath:  cliContext.Key,
			CaPath:   cliContext.CA,
		},
	}
}
