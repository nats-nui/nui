package channels

import "sync"

func FanIn[T any](buffer int, ins ...<-chan T) <-chan T {
	out := make(chan T, buffer)
	var wg sync.WaitGroup
	wg.Add(len(ins))

	for _, c := range ins {
		go func(c <-chan T) {
			defer wg.Done()
			for n := range c {
				out <- n
			}
		}(c)
	}

	go func() {
		wg.Wait()
		close(out)
	}()

	return out
}
