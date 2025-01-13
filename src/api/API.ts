import axios from "axios"

export abstract class API {
    rootPath: string = import.meta.env.VITE_BACKEND_API_ROOT
    subPath: string = ""

    constructor(subPath: string) {
        this.subPath = subPath
    }

    buildCommandPath(command: string, params?: { [key: string]: string }) {
        var urlParams

        if (params) {
            urlParams = new URLSearchParams(window.location.search);

            for (const [key, value] of Object.entries(params)) {
                urlParams.set(key, value)
            }

            urlParams = "?" + urlParams.toString()
        }

        return [this.rootPath, this.subPath, command, ""].join("/") + (urlParams ?? "")
    }

    get(path: string) {
        return axios
            .get(path, {
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials":  "true",
                    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST, PUT",
                    "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
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
                headers: {'Content-Type': 'application/json'}
            })
            .then(res => res.data)
            .catch(err => err)
    }
}