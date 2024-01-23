import { camelToSnake, snakeToCamel } from "@/utils/object"



enum METHOD {
	POST = "post",
	GET = "get",
	PATCH = "patch",
	PUT = "put",
	DELETE = "delete"
}
interface Options {
	baseUrl: string
}
interface CallOptions {
	isLogin?: boolean
	noBusy?: boolean
	noDialogError?: boolean,
}

const httpUrlBuilder = () => {
	if (import.meta.env.VITE_TARGET == "desktop") return "http://localhost:3111/api/"
	return import.meta.env.DEV || !import.meta.env.VITE_API_URL ? "/api/" : import.meta.env.VITE_API_URL
}

const optionsParamDefault: CallOptions = {
	isLogin: false,
	noBusy: false,
	noDialogError: false,
}
const optionsDefault: Options = {
	baseUrl: httpUrlBuilder(),
}


export class AjaxService {

	options: Options

	constructor(options: Options = optionsDefault) {
		this.options = { ...optionsDefault, ...options }
	}

	async post(url: string, data?: any, options?: CallOptions) {
		return await this.send(url, METHOD.POST, data, options)
	}
	async get(url: string, data?: any, options?: CallOptions) {
		//console.log(`target: ${import.meta.env.VITE_TARGET}`)
		return await this.send(url, METHOD.GET, data, options)
	}
	async patch(url: string, data?: any, options?: CallOptions) {
		return await this.send(url, METHOD.PATCH, data, options)
	}
	async put(url: string, data?: any, options?: CallOptions) {
		return await this.send(url, METHOD.PUT, data, options)
	}
	async delete(url: string, data?: any, options?: CallOptions) {
		return await this.send(url, METHOD.DELETE, data, options)
	}

	/**
	 * Send a ajax to server
	 */
	async send(url: string, method: METHOD, data?: any, options: CallOptions = {}) {
		options = { ...optionsParamDefault, ...options }

		// send request
		data = camelToSnake(data)
		const headers = {
			"Content-Type": "application/json",
			"Accept": "application/json",
		}
		let response = null
		try {
			response = await fetch(
				`${this.options.baseUrl}${url}`,
				{
					method: method,
					headers,
					body: data ? JSON.stringify(data) : undefined,
				}
			)
		} catch (error) {
			console.error(error)
			throw error

		} finally {
		}

		// prelevo i dati
		let ret = null
		try {
			ret = snakeToCamel(await response.json())
		} catch (e) { }

		// MANAGE ERRORS
		const status = response.status
		if (status >= 400) {

			let error = ret?.error ? { code: ret.error, field: "" } : null
			error = !error && ret?.errors && ret.errors[0] ? ret.errors[0] : { code: "default", field: "" }
			throw response
		}
		return ret
	}
}

export default new AjaxService()

