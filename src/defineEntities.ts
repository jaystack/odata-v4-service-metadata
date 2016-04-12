export var defineEntities = (entityConfig) => {
    var annotations = {}
    var edmx = {
        dataServices: {
            schema: [
                {
                    namespace: entityConfig.namespace,
                    annotations: [],
                    entityType: entityConfig.entities && entityConfig.entities.map(e => {
                        var def = {
                            name: e.name,
                            property: []
                        }

                        e.keys && (def['key'] = [
                            { propertyRef: e.keys.map(k => { return { name: k } }) }
                        ])

                        e.properties && Object.keys(e.properties).forEach(p => {
                            def.property.push({
                                name: p,
                                type: e.properties[p]
                            })
                        })

                        e.annotations && e.annotations.forEach(a => {
                            if (typeof a.value === 'undefined' || a.value == null) return

                            var target = (entityConfig.namespace ? (entityConfig.namespace + '.') : '') + e.name
                            if (a.property) target += '/' + a.property
                            annotations[target] = annotations[target] || {
                                target: target,
                                annotation: []
                            }
                            annotations[target].annotation.push({ term: a.name, string: a.value.toString() })
                        })
                        return def;
                    }),
                    entityContainer: {
                        name: entityConfig.containerName,
                        entitySet: entityConfig.entities && entityConfig.entities.map(e => {
                            return {
                                name: e.collectionName,
                                entityType: (entityConfig.namespace ? (entityConfig.namespace + '.') : '') + e.name
                            }
                        })
                    }
                }
            ]
        }
    }
    var entityNames = Object.keys(entityConfig.entities)

    //computed
    entityConfig.entities && entityConfig.entities.map(e => {
        if(!e.computedKey) return
        var target = (entityConfig.namespace ? (entityConfig.namespace + '.') : '') + e.name
        
        if(!annotations[target])
            annotations[target] = { target: target, annotation: [] }
        
        annotations[target].annotation.push({
            term: 'Org.OData.Core.V1.Computed',
            bool: 'true'
        })
    })

    edmx.dataServices.schema[0].annotations = Object.keys(annotations).map(a => {
        return annotations[a]
    })
    
    return edmx;
}