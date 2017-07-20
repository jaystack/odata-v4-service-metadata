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
                    action: entityConfig.actions && entityConfig.actions.map(a => {
                        var def = {
                            name: a.name,
                            isBound: undefined,
                            parameter: undefined,
                            returnType: undefined
                        }
                        if ('isBound' in a) def.isBound = a.isBound
                        if ('parameters' in a) def.parameter = a.parameters
                        if ('returnType' in a) {
                            if (typeof a.returnType == 'string') {
                                def.returnType = { type: a.returnType }
                            } else {
                                def.returnType = a.returnType
                            }
                        }
                        return def;
                    }),
                    function: entityConfig.functions && entityConfig.functions.map(a => {
                        var def = {
                            name: a.name,
                            isBound: undefined,
                            parameter: undefined,
                            returnType: undefined
                        }
                        if ('isBound' in a) def.isBound = a.isBound
                        if ('parameters' in a) def.parameter = a.parameters
                        if ('returnType' in a) {
                            if (typeof a.returnType == 'string') {
                                def.returnType = { type: a.returnType }
                            } else {
                                def.returnType = a.returnType
                            }
                        }
                        return def;
                    }),
                    entityContainer: {
                        name: entityConfig.containerName,
                        entitySet: entityConfig.entities && entityConfig.entities.map(e => {
                            return {
                                name: e.collectionName,
                                entityType: (entityConfig.namespace ? (entityConfig.namespace + '.') : '') + e.name
                            }
                        }),
                        actionImport: entityConfig.actions && entityConfig.actions.filter(a => !a.isBound).map(a => {
                            var def = {
                                name: a.name,
                                action: (entityConfig.namespace ? (entityConfig.namespace + '.') : '') + a.name,
                                entitySet: undefined
                            }
                            if ('entitySet' in a) def.entitySet = a.entitySet
                            return def;
                        }),
                        functionImport: entityConfig.functions && entityConfig.functions.filter(a => !a.isBound).map(a => {
                            var def = {
                                name: a.name,
                                function: (entityConfig.namespace ? (entityConfig.namespace + '.') : '') + a.name,
                                includeInServiceDocument: undefined,
                                entitySet: undefined
                            }
                            if ('includeInServiceDocument' in a) def.includeInServiceDocument = a.includeInServiceDocument
                            if ('entitySet' in a) def.entitySet = a.entitySet
                            return def;
                        })
                    }
                }
            ]
        }
    }

    //computed
    entityConfig.entities && entityConfig.entities.map(e => {
        if (!e.computedKey || !e.keys || e.keys.length !== 1) return
        var target = (entityConfig.namespace ? (entityConfig.namespace + '.') : '') + e.name + "/" + e.keys[0]

        if (!annotations[target])
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