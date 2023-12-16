package tests

import (
	"encoding/json"
	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/suite"
	"testing"
)

func (suite *NuiTestSuite) TestCRUDConnections() {
	a := fiber.Get(suite.NuiHost("/api/connection"))
	status, body, errs := a.Bytes()

	suite.Empty(errs)
	suite.Equal(200, status)
	suite.JSONEq(`[]`, string(body))

	a = fiber.Post(suite.NuiHost("/api/connection"))
	post := []byte(`{
		"name": "c1",
		"hosts": ["host1", "host2"],
		"subscriptions": [{"subject": "sub1"}, {"subject": "sub2"}]
	}`)
	var m map[string]any
	err := json.Unmarshal(post, &m)
	suite.NoError(err)
	a.JSON(m)

	status, body, errs = a.Bytes()
	suite.Empty(errs)
	suite.Equal(201, status)

	a = fiber.Get(suite.NuiHost("/api/connection"))
	status, body, errs = a.Bytes()

	suite.JSONEq(`[{
		"name": "c1",
		"hosts": ["host1", "host2"],
		"subscriptions": [{"subject": "sub1"}, {"subject": "sub2"}]
	}]`, string(body))

}

func TestNuiTestSuite(t *testing.T) {
	suite.Run(t, new(NuiTestSuite))
}
