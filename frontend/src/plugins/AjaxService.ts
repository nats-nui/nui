import docsSo from "@/stores/docs"
import logSo from "@/stores/log"
import { MESSAGE_TYPE } from "@/stores/log/utils"
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
export interface CallOptions {
	isLogin?: boolean
	loading?: boolean
	noError?: boolean
	targetId?: string
}

const httpUrlBuilder = () => {
	if (import.meta.env.VITE_TARGET == "desktop") return "http://localhost:3111/api/"
	return import.meta.env.DEV || !import.meta.env.VITE_API_URL ? "/api/" : import.meta.env.VITE_API_URL
}

const optionsParamDefault: CallOptions = {
	isLogin: false,
	loading: false,
	noError: false,
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

		// SEND REQUEST
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
		} catch (e) {
			if ( options.noError ) return
			logSo.add({
				type: MESSAGE_TYPE.ERROR,
				body: e.toString(),
				targetId: options.targetId,
			})
			throw e
		}

		// GET DATA
		let ret = null
		let jsonError:string = null
		try {
			ret = snakeToCamel(await response.json())
		} catch (e) { 
			jsonError = e.toString()
		}

		// MANAGE HTTP ERRORS
		const status = response.status
		if (status >= 400 && !options.noError) {
			const error = response?.error as string ?? jsonError ?? `${status} generic`
			logSo.add({
				type: MESSAGE_TYPE.ERROR,
				body: error,
				targetId: options.targetId,
			})
			throw error
		}
		return ret
	}
}

export default new AjaxService()

