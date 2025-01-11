import { API } from "../areas/api/API"

export class ManyToManyManager {
    static async handleAdd (
        parent: any,
        parentSubpath: string,
        parentAttribute: string,
        child: any,
        childSubpath: string,
        childAttribute: string,
        route: string,
    ) {
        const parentAPI = new API<typeof parent>(parentSubpath)
        const childAPI  = new API<typeof child>(childSubpath)
        const response = await childAPI.post(child)
        const newChildID = response.id
      
        const patchData = JSON.stringify({
            [parentAttribute]: parent.id,
            [childAttribute]: newChildID,
        })

        const updatedParent = await parentAPI.custom(route, patchData)

        return updatedParent
    }

    static async handleDelete (
        parent: any,
        parentSubpath: string,
        child: any,
        childSubpath: string,
        grandchildren?: any[],
        grandchild_subpath?: string,
    ) {        
        const parentAPI = new API<typeof parent>(parentSubpath)
        const childAPI  = new API<typeof child>(childSubpath)
        
        if (grandchildren && grandchild_subpath) {
            const grandchildAPI = new API<typeof grandchildren[0]>(grandchild_subpath)
            
            const grandchildIDs = ManyToManyManager.getListOfIDs(grandchildren)

            grandchildIDs.forEach(async gID => {
                await grandchildAPI.delete(gID)
            })
        }
        
        await childAPI.delete(child.id)

        const updatedParent = await parentAPI.get_i(parent.id)
        return updatedParent
    }

    static getListOfIDs(list: { id: number | undefined }[]) {
        return list.map(item => item.id)
    }
}