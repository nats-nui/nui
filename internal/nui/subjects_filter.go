package nui

import (
	"errors"
	"slices"
	"strings"
	"unicode"
)

var errFilterInvalid = errors.New("that is not a valid subject")

const (
	kindStream   = "stream"
	kindKV       = "kv"
	kindObject   = "object"
	kindPattern  = "pattern"
	kindOccupied = "occupied"
)

func validateListenFilter(filter string) error {
	filter = strings.TrimSpace(filter)
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
		if tok == ">" && i != len(tokens)-1 {
			return errFilterInvalid
		}
	}
	return nil
}

func isLiteralSubject(subject string) bool {
	if subject != strings.TrimSpace(subject) || validateListenFilter(subject) != nil {
		return false
	}
	tokens := strings.Split(subject, ".")
	return !slices.Contains(tokens, "*") && !slices.Contains(tokens, ">")
}

func isInternalSubject(subject string) bool {
	token, _, _ := strings.Cut(subject, ".")
	return token == "$SYS" || token == "$JS" || token == "_INBOX"
}

func streamBucket(name string, subjects []string) (kind, pattern string) {
	if bucket, ok := strings.CutPrefix(name, "KV_"); ok && bucket != "" &&
		len(subjects) == 1 && subjects[0] == "$KV."+bucket+".>" {
		return kindKV, subjects[0]
	}
	if bucket, ok := strings.CutPrefix(name, "OBJ_"); ok && bucket != "" &&
		len(subjects) == 2 && slices.Contains(subjects, "$O."+bucket+".C.>") &&
		slices.Contains(subjects, "$O."+bucket+".M.>") {
		return kindObject, "$O." + bucket + ".>"
	}
	return kindStream, ""
}
