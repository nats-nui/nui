package nui

import "strings"

// MatchSubject checks if a subscription subject matches a target subject.
// Supports NATS wildcards:
//   - * matches a single token
//   - > matches one or more tokens (must be last token)
//
// Examples:
//
//	MatchSubject("orders.*", "orders.new") = true
//	MatchSubject("orders.>", "orders.new.item") = true
//	MatchSubject("orders.new", "orders.new") = true
//	MatchSubject("orders.*", "orders.new.item") = false
func MatchSubject(subscription, target string) bool {
	if subscription == target {
		return true
	}

	subTokens := strings.Split(subscription, ".")
	targetTokens := strings.Split(target, ".")

	return matchTokens(subTokens, targetTokens)
}

func matchTokens(subTokens, targetTokens []string) bool {
	subIdx := 0
	targetIdx := 0

	for subIdx < len(subTokens) && targetIdx < len(targetTokens) {
		subToken := subTokens[subIdx]

		// > matches the rest of the subject (one or more tokens)
		if subToken == ">" {
			// > must have at least one more token to match
			return targetIdx < len(targetTokens)
		}

		// * matches exactly one token
		if subToken == "*" {
			subIdx++
			targetIdx++
			continue
		}

		// Exact match required
		if subToken != targetTokens[targetIdx] {
			return false
		}

		subIdx++
		targetIdx++
	}

	// If subscription ended with >, we already returned true
	// Otherwise, both must be exhausted for a match
	return subIdx == len(subTokens) && targetIdx == len(targetTokens)
}

// FindMatchingClients finds all client connections that have subscriptions
// matching the given subject (deliverSubject or filterSubject).
func FindMatchingClients(connections []map[string]any, subject string) []map[string]any {
	if subject == "" {
		return nil
	}

	var matches []map[string]any

	for _, conn := range connections {
		subsRaw, ok := conn["subscriptions_list_detail"]
		if !ok {
			continue
		}

		subs, ok := subsRaw.([]any)
		if !ok {
			continue
		}

		for _, subRaw := range subs {
			sub, ok := subRaw.(map[string]any)
			if !ok {
				continue
			}

			subSubject, ok := sub["subject"].(string)
			if !ok {
				continue
			}

			// Check if the client's subscription matches the consumer's subject
			// The client might subscribe with wildcards, or the consumer's subject might have wildcards
			if MatchSubject(subSubject, subject) || MatchSubject(subject, subSubject) {
				matches = append(matches, conn)
				break // Only add each connection once
			}
		}
	}

	return matches
}
