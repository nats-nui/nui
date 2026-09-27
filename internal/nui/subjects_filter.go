package nui

import (
	"errors"
	"slices"
	"strings"
	"unicode"
)

var (
	errFilterInvalid = errors.New("that is not a valid subject")
)

const (
	kindStream   = "stream"
	kindKV       = "kv"
	kindObject   = "object"
	kindPattern  = "pattern"
	kindOccupied = "occupied"
)

func normalizeListenFilter(filter string) string {
	return strings.TrimSpace(filter)
}

func validateListenFilter(filter string) error {
	filter = normalizeListenFilter(filter)
	for _, r := range filter {
		if unicode.IsSpace(r) || unicode.IsControl(r) {
			return errFilterInvalid
		}
	}
	tokens := strings.Split(filter, ".")
	for i, tok := range tokens {
		if tok == "" {
			return errFilterInvalid
		}
		if tok == ">" {
			if i != len(tokens)-1 {
				return errFilterInvalid
			}
			continue
		}
		if tok == "*" {
			continue
		}
		if strings.ContainsAny(tok, "*>") {
			return errFilterInvalid
		}
	}
	return nil
}

func isInternalSubject(subject string) bool {
	return hasSubjectPrefix(subject, "$SYS") ||
		hasSubjectPrefix(subject, "$JS") ||
		hasSubjectPrefix(subject, "_INBOX")
}

func hideInternal(discardSys bool, subject string) bool {
	return discardSys && isInternalSubject(subject)
}

func hasSubjectPrefix(subject, prefix string) bool {
	return subject == prefix || strings.HasPrefix(subject, prefix+".")
}

func streamKind(name string, subjects []string) string {
	if bucket, ok := strings.CutPrefix(name, "KV_"); ok && bucket != "" &&
		len(subjects) == 1 && subjects[0] == "$KV."+bucket+".>" {
		return kindKV
	}
	if bucket, ok := strings.CutPrefix(name, "OBJ_"); ok && bucket != "" &&
		len(subjects) == 2 && slices.Contains(subjects, "$O."+bucket+".C.>") &&
		slices.Contains(subjects, "$O."+bucket+".M.>") {
		return kindObject
	}
	return kindStream
}

func collapsePattern(subject, kind string) (path, outKind string) {
	parts := strings.Split(subject, ".")
	switch kind {
	case kindKV:
		if len(parts) >= 2 && parts[0] == "$KV" {
			return "$KV." + parts[1] + ".>", kindKV
		}
	case kindObject:
		if len(parts) >= 2 && parts[0] == "$O" {
			return "$O." + parts[1] + ".>", kindObject
		}
	}
	return subject, kindPattern
}
