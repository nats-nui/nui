package channels

func FanIn[T any](buffer int, ins ...<-chan T) <-chan T {
	out := make(chan T, buffer)
	for _, c := range ins {
		go func(c <-chan T) {
			for n := range c {
				out <- n
			}
		}(c)
	}
	return out
}
