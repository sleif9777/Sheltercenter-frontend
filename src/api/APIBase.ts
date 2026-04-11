import axios, { AxiosRequestConfig, AxiosResponse, HttpStatusCode } from "axios"
import { useSessionState } from "../core/session/SessionState"

axios.interceptors.request.use((config) => {
	const token = useSessionState.getState().accessToken
	if (token) {
		config.headers = config.headers ?? {}
		config.headers["Authorization"] = `Bearer ${token}`
	}
	return config
})

export abstract class APIBase {
	rootPath: string = import.meta.env.VITE_BACKEND_API_ROOT
	subPath: string = ""

	constructor(subPath: string) {
		this.subPath = subPath
	}

	async deleteRecord<T>(id: number) {
		const path = [this.rootPath, this.subPath, id, ""].join("/")
		return this.deleteResp<T>(path)
	}

	async deleteResp<T>(path: string): Promise<HttpStatusCode> {
		const { status } = await axios.delete<T>(path, {
			headers: { "Content-Type": "application/json" },
		})
		return status
	}

	async buildAndGetBlob<P extends Record<string, string | number | boolean> = {}>(
		commandName: string,
		params?: P
	): Promise<Blob> {
		const path = this.buildCommandPath(commandName, params)
		const response = await this.getResp<Blob>(path, {
			responseType: "blob",
		})
		return response.data
	}

	async buildAndGetData<T, P extends Record<string, string | number | boolean> = {}>(
		commandName: string,
		params?: P
	): Promise<T> {
		const path = this.buildCommandPath(commandName, params)
		return (await this.getResp<T>(path)).data
	}

	async buildAndGetFullResponse<T, P extends Record<string, string | number | boolean> = {}>(
		commandName: string,
		params?: P
	): Promise<AxiosResponse<T>> {
		const path = this.buildCommandPath(commandName, params)
		return this.getResp<T>(path)
	}

	async getResp<T>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
		return axios
			.get<T>(path, {
				headers: { "Content-Type": "application/json" },
				...config,
			})
			.then((res) => res)
			.catch((err) => err.response)
	}

	async buildAndPost<P extends object>(commandName: string, data: P): Promise<AxiosResponse> {
		const path = this.buildCommandPath(commandName)
		return this.postResp<P>(path, data)
	}

	async postResp<P extends object>(path: string, data: P): Promise<AxiosResponse> {
		return axios
			.post(path, data)
			.then((res) => res)
			.catch((err) => err)
	}

	async buildAndPostFormData<T>(commandName: string, data: FormData): Promise<T> {
		const path = this.buildCommandPath(commandName)
		return (await this.postFormDataResp<T>(path, data)).data
	}

	async postFormDataResp<T>(path: string, data: FormData): Promise<AxiosResponse<T>> {
		return axios
			.post(path, data, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
			.then((res) => res)
			.catch((err) => err)
	}

	buildCommandPath<P extends { [key: string]: string | number | boolean }>(command: string, params?: P): string {
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

	// DEPRECATED; use above functions instead
	get(path: string) {
		return axios
			.get(path, {
				headers: {
					"Content-Type": "application/json",
				},
			})
			.then((res) => res)
			.catch((err) => err)
	}

	getSingleItem(id: number) {
		const path = [this.rootPath, this.subPath, id, ""].join("/")
		return this.get(path)
	}

	post(path: string, data: {}) {
		return axios
			.post(path, data)
			.then((res) => res)
			.catch((err) => err)
	}
}
