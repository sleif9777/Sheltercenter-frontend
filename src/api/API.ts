import axios, { AxiosResponse } from "axios"

export abstract class API {
	rootPath: string = import.meta.env.VITE_BACKEND_API_ROOT
	subPath: string = ""

	constructor(subPath: string) {
		this.subPath = subPath
	}

	async buildAndGet<T, P extends { [key: string]: string | number } = {}>(
		commandName: string,
		params?: P
	): Promise<AxiosResponse<T>> {
		const path = this.buildCommandPath<P>(commandName, params)
		return await this.getResp<T>(path)
	}
	
	async getResp<T>(path: string): Promise<AxiosResponse<T>> {
		try {
			const res: AxiosResponse<T> = await axios.get<T>(path, {
				headers: { "Content-Type": "application/json" },
			})
			return res
		} catch (err: any) {
			return err
		}
	}
	
	buildCommandPath<P extends { [key: string]: string | number }>(
		command: string,
		params?: P
	): string {
		let urlParams
	
		if (params) {
			const searchParams = new URLSearchParams(window.location.search)
			for (const [key, value] of Object.entries(params)) {
				searchParams.set(key, value.toString())
			}
			urlParams = "?" + searchParams.toString()
		}
	
		return [this.rootPath, this.subPath, command, ""].join("/") + (urlParams ?? "")
	}	

	// DEPRECATED; use getResp instead
	get(path: string) {
		return axios
			.get(path, {
				"headers": {
					"Content-Type": "application/json",
				}
			})
			.then(res => res)
			.catch(err => err)
	}

	getSingleItem(id: number) {
		const path = [this.rootPath, this.subPath, id, ""].join("/")
		return this.get(path)
	}

	post(path: string, data: {}) {
		return axios
			.post(path, data)
			.then(res => res)
			.catch(err => err)
	}

	delete(id: number, path: string = [this.rootPath, this.subPath, id, ""].join("/")) {
		return axios
			.delete(path)
			.then(res => res)
			.catch(err => err)
	}

	patch(id: number, data: {}) {
		return axios
			.patch(`${this.rootPath}${id}/`, data, {
				headers: { 'Content-Type': 'application/json' }
			})
			.then(res => res.data)
			.catch(err => err)
	}
}