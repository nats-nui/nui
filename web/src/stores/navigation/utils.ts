
export function setParams(params: string[], query: string): string {
	const queryParams = new URLSearchParams(query)

	for (let cont = 0; cont < params.length; cont += 2) {
		const value = params[cont + 1]
		const name = params[cont]
		if (value != null && value.toString().length > 0) {
			queryParams.set(name, value)
		} else {
			queryParams.delete(name)
		}
	}
	const queryUrl = queryParams.toString()
	return queryUrl
}

