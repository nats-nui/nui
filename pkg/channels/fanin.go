package channels

import (
	"context"
	"sync"
)

func FanIn[T any](ctx context.Context, buffer int, ins ...<-chan T) <-chan T {
	out := make(chan T, buffer)
	wg := sync.WaitGroup{}
	wg.Add(len(ins))
	go func() {
		wg.Wait()
		close(out)
	}()
	for _, c := range ins {
		go func(c <-chan T) {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case n, ok := <-c:
					if !ok {
						return
					}
					select {
					case <-ctx.Done():
						return
					case out <- n:
					}
				}
			}
		}(c)
	}
	return out
}
