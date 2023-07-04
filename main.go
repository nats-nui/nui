package main

import (
	"fmt"
	"github.com/nats-io/nats.go"
)

func main() {
	fmt.Print("hi")
	ns, err := nats.Connect("127.0.0.1:4555")

}
