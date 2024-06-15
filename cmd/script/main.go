package main

import (
	"context"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"log"
	"strings"
)

func main() {
	// Connect to a NATS server
	nc, err := nats.Connect("10.13.20.55")
	if err != nil {
		log.Fatal(err)
	}
	defer nc.Close()
	ctx := context.Background()
	js, err := jetstream.New(nc)
	if err != nil {
		log.Fatal(err)
	}

	kv, err := js.KeyValue(ctx, "plc-console_metadata")
	if err != nil {
		log.Fatal(err)
	}
	ks, err := kv.ListKeys(ctx)
	if err != nil {
		log.Fatal(err)
	}
	ctr := 0
	for k := range ks.Keys() {
		if strings.HasPrefix(k, "metadata.ZR13_AUH_01") {
			ctr++
			log.Printf("key: %s, value: %s\n", k)
			err := kv.Delete(ctx, k)
			if err != nil {
				log.Fatal(err)
			}
		}
	}
	log.Printf("total keys: %d\n", ctr)

}
