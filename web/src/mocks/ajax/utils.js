/* eslint eqeqeq: "off" */
import { rest } from "msw"


export function requestValidator ( method, url, callback ) {
	return rest[method](url, (req,res,ctx)=> {
		const auth = req.headers.get("Authorization")
		if ( auth==null || auth.startsWith("Bearer")==false ) return res(ctx.status(401))
		return callback(req,res,ctx)
	})
}
