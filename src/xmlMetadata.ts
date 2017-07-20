import { Edm } from 'odata-v4-metadata'
import * as extend from 'extend'
import { Xml } from './XmlCreator'

export class XmlMetadata {
    public metadata: Edm.Edmx
    private options: any

    constructor(options: any, edmx: Edm.Edmx) {
        this.options = extend({
            edmx: 'http://docs.oasis-open.org/odata/ns/edmx',
            m: 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
            d: 'http://schemas.microsoft.com/ado/2007/08/dataservices',
            namespace: 'http://docs.oasis-open.org/odata/ns/edm',
            edmxVersion: '4.0',
            xmlHead: '<?xml version="1.0" encoding="UTF-8"?>',
            contextNamespace: 'MyContext'
        }, options)

        this.metadata = edmx
    }


    processMetadata() {
        var xml = new Xml.XmlCreator()
        var xmlResult = this.options.xmlHead

        xml.startDocument()
        this.buildEdmx(xml, this.metadata)
        xml.endDocument()

        xmlResult += xml.getXmlString()

        return xmlResult
    }

    buildEdmx(xml: Xml.XmlCreator, edmx: Edm.Edmx) {
        var ns = xml.declareNamespace(this.options.edmx, 'edmx');
        var edmxElement = xml.declareElement(ns, 'Edmx');
        var version = xml.declareAttribute('Version');

        xml.startElement(edmxElement)
            .addAttribute(version, edmx.version || this.options.edmxVersion);

        this.buildDataServices(xml, edmx.dataServices);
        xml.endElement();
    }

    buildDataServices(xml: Xml.XmlCreator, dataservices: Edm.DataServices) {
        var ns = xml.declareNamespace(this.options.edmx, 'edmx');
        var dataservicesElement = xml.declareElement(ns, 'DataServices');

        xml.startElement(dataservicesElement)

        this.buildSchema(xml, dataservices.schemas);
        xml.endElement();
    }

    buildSchema(xml: Xml.XmlCreator, schemas: Edm.Schema[]) {
        schemas && schemas.forEach(schema => {
            var xmlns = xml.declareAttribute('xmlns');
            var schemaElement = xml.declareElement('Schema');
            var ns = xml.declareAttribute('Namespace');

            xml.startElement(schemaElement)
                .addAttribute(xmlns, this.options.namespace)
                .addAttribute(ns, schema.namespace || this.options.contextNamespace);

            if (schema.alias)
                xml.addAttribute(xml.declareAttribute('Alias'), schema.alias);

            this.buildEntityTypes(xml, schema.entityTypes)
            this.buildComplexTypes(xml, schema.complexTypes)
            this.buildTypeDefinitions(xml, schema.typeDefinitions)
            this.buildEnumTypes(xml, schema.enumTypes)
            this.buildActions(xml, schema.actions)
            this.buildFunctions(xml, schema.functions)
            this.buildEntityContainer(xml, schema.entityContainer);
            this.buildSchemaAnnotations(xml, schema.annotations)

            xml.endElement();
        })
    }

    buildTypeDefinitions(xml: Xml.XmlCreator, typeDefinitions: Edm.TypeDefinition[]) {
        typeDefinitions && typeDefinitions.forEach(typeDefinition => {
            var rootElement = xml.declareElement('TypeDefinition')
            var name = xml.declareAttribute('Name')

            xml.startElement(rootElement)
                .addAttribute(name, typeDefinition.name)

            if (typeDefinition.underlyingType)
                xml.addAttribute(xml.declareAttribute('UnderlyingType'), typeDefinition.underlyingType)

            this.buildAnnotations(xml, typeDefinition.annotations)

            xml.endElement()
        })
    }

    buildEnumTypes(xml: Xml.XmlCreator, enumTypes: Edm.EnumType[]) {
        enumTypes && enumTypes.forEach((enumType: Edm.EnumType) => {
            var rootElement = xml.declareElement('EnumType')
            var name = xml.declareAttribute('Name')

            xml.startElement(rootElement)
                .addAttribute(name, enumType.name)

            if (enumType.namespace)
                xml.addAttribute(xml.declareAttribute('Namespace'), enumType.namespace)

            if (enumType.underlyingType)
                xml.addAttribute(xml.declareAttribute('UnderlyingType'), enumType.underlyingType)

            if (enumType.isFlags)
                xml.addAttribute(xml.declareAttribute('IsFlags'), enumType.isFlags)

            this.buildEnumMembers(xml, enumType.members)
            this.buildAnnotations(xml, enumType.annotations)

            xml.endElement()
        })
    }

    buildEntityTypes(xml: Xml.XmlCreator, entityTypes: Edm.EntityType[]) {
        entityTypes && entityTypes.forEach(entityType => {
            this.buildType(xml, entityType, 'EntityType')
        })
    }

    buildComplexTypes(xml: Xml.XmlCreator, complexTypes: Edm.ComplexType[]) {
        complexTypes && complexTypes.forEach(complexType => {
            this.buildType(xml, complexType, 'ComplexType')
        })
    }

    buildType(xml: Xml.XmlCreator, type: Edm.EntityType | Edm.ComplexType, xmlElementName: string) {
        var rootElement = xml.declareElement(xmlElementName)
        var name = xml.declareAttribute('Name')

        xml.startElement(rootElement)
            .addAttribute(name, type.name)

        if (type.baseType)
            xml.addAttribute(xml.declareAttribute('BaseType'), type.baseType)

        if (type.abstract)
            xml.addAttribute(xml.declareAttribute('Abstract'), type.abstract)

        if (type.openType)
            xml.addAttribute(xml.declareAttribute('OpenType'), type.openType)

        if (type.hasStream)
            xml.addAttribute(xml.declareAttribute('HasStream'), type.hasStream)

        if (type instanceof Edm.EntityType){
            this.buildTypeKeys(xml, (<Edm.EntityType>type).key)
        }
        this.buildTypeProperties(xml, type.properties)
        this.buildTypeNavigationProperties(xml, type.navigationProperties)
        this.buildAnnotations(xml, type.annotations)

        xml.endElement()
    }

    buildTypeKeys(xml: Xml.XmlCreator, key: Edm.Key) {
        if (!key) return;

        var keyElement = xml.declareElement('Key')
        var propRef = xml.declareElement('PropertyRef')
        var name = xml.declareAttribute('Name')

        var keys = key.propertyRefs
        if (keys.length > 0) {
            xml.startElement(keyElement)

            keys.forEach(keyDef => {
                xml.startElement(propRef)
                    .addAttribute(name, keyDef.name)

                if (keyDef.alias)
                    xml.addAttribute(xml.declareAttribute('Alias'), keyDef.alias)

                xml.endElementInline()
            })
            xml.endElement()
        }
    }

    buildTypeProperties(xml: Xml.XmlCreator, properties: Edm.Property[]) {
        properties && properties.forEach(property => {
            var propertyElement = xml.declareElement('Property');

            xml.startElement(propertyElement);

            this.buildAttributes(xml, property, this.typePropertyAttributes)
            this.buildAnnotations(xml, property.annotations)

            xml.endElementInline();
        })
    }

    typePropertyAttributes: Object = {
        name: { name: 'Name' },
        type: { name: 'Type' },
        nullable: { name: 'Nullable' },
        maxLength: { name: 'MaxLength' },
        precision: { name: 'Precision' },
        scale: { name: 'Scale' },
        unicode: { name: 'Unicode' },
        SRID: { name: 'SRID' },
        defaultValue: { name: 'DefaultValue' }
    }

    buildTypeNavigationProperties(xml: Xml.XmlCreator, navigationProperties: Edm.NavigationProperty[]) {
        navigationProperties && navigationProperties.forEach(navigationProperty => {
            var navigationPropertyElement = xml.declareElement('NavigationProperty');

            xml.startElement(navigationPropertyElement);

            this.buildAttributes(xml, navigationProperty, this.typeNavigationPropertyAttributes)
            this.buildNavPropertyReferentialConstraints(xml, navigationProperty.referentialConstraints)
            this.buildAnnotations(xml, navigationProperty.annotations)

            xml.endElementInline();
        })
    }

    buildNavPropertyReferentialConstraints(xml: Xml.XmlCreator, referentialConstraints: Edm.ReferentialConstraint[]) {
        referentialConstraints && referentialConstraints.forEach(referentialConstraint => {
            var referentialConstraintElement = xml.declareElement('ReferentialConstraint');
            xml.startElement(referentialConstraintElement);
            
            if(referentialConstraint.property)
                xml.addAttribute(xml.declareAttribute("Property"), referentialConstraint.property);
                
            if(referentialConstraint.referencedProperty)
                xml.addAttribute(xml.declareAttribute("ReferencedProperty"), referentialConstraint.referencedProperty);
            
            xml.endElementInline();
        })
    }

    typeNavigationPropertyAttributes: Object = {
        name: { name: 'Name' },
        type: { name: 'Type' },
        nullable: { name: 'Nullable' },
        containsTarget: { name: 'ContainsTarget' },
        partner: { name: 'Partner' }
    }

    buildEnumMembers(xml: Xml.XmlCreator, members: Edm.Member[]) {
        members && members.forEach(member => {
            var memberElement = xml.declareElement('Member');

            xml.startElement(memberElement);

            this.buildAttributes(xml, member, this.typeMemberAttributes)
            this.buildAnnotations(xml, member.annotations)

            xml.endElementInline();
        })
    }

    typeMemberAttributes: Object = {
        name: { name: 'Name' },
        value: { name: 'Value' }
    }

    buildAttributes(xml: Xml.XmlCreator, object: any, mappings: any) {
        var attributes = mappings && Object.keys(mappings);
        object && attributes && attributes.forEach(prop => {
            if (typeof object[prop] !== 'undefined' && object[prop] !== null) {
                var attr = xml.declareAttribute(mappings[prop].name)
                xml.addAttribute(attr, object[prop].toString());
            }
        });
    }

    buildActions(xml: Xml.XmlCreator, actions: Edm.Action[]){
        actions && actions.forEach(action => {
            var actionElement = xml.declareElement('Action');
            var name = xml.declareAttribute('Name')

            xml.startElement(actionElement)
                .addAttribute(name, action.name)
                
            if(typeof action.isBound !== 'undefined')
                xml.addAttribute(xml.declareAttribute('IsBound'), action.isBound.toString())
                
            if(action.entitySetPath)
                xml.addAttribute(xml.declareAttribute('EntitySetPath'), action.entitySetPath)

            this.buildParameters(xml, action.parameters)
            this.buildReturnType(xml, action.returnType)
            this.buildAnnotations(xml, action.annotations)

            xml.endElementInline();
        })
    }
    
    buildFunctions(xml: Xml.XmlCreator, functions: Edm.Function[]){
        functions && functions.forEach(func => {
            var funcElement = xml.declareElement('Function');
            var name = xml.declareAttribute('Name')

            xml.startElement(funcElement)
                .addAttribute(name, func.name)
                
            if(typeof func.isBound !== 'undefined')
                xml.addAttribute(xml.declareAttribute('IsBound'), func.isBound.toString())
                
            if(func.entitySetPath)
                xml.addAttribute(xml.declareAttribute('EntitySetPath'), func.entitySetPath)
                
            if(typeof func.isComposable !== 'undefined')
                xml.addAttribute(xml.declareAttribute('IsComposable'), func.isComposable.toString())
                
            this.buildParameters(xml, func.parameters)
            this.buildReturnType(xml, func.returnType)
            this.buildAnnotations(xml, func.annotations)

            xml.endElementInline();
        })
    }
    
    buildParameters(xml: Xml.XmlCreator, parameters: Edm.Parameter[]){
        parameters && parameters.forEach(parameter => {
            var parameterElement = xml.declareElement('Parameter');
            
            xml.startElement(parameterElement)
                
            this.buildAttributes(xml, parameter, this.parameterAttributes)
            this.buildAnnotations(xml, parameter.annotations)

            xml.endElementInline();
        })
    }

    parameterAttributes: Object = {
        name: { name: 'Name' },
        type: { name: 'Type' },
        nullable: { name: 'Nullable' },
        maxLength: { name: 'MaxLength' },
        precision: { name: 'Precision' },
        scale: { name: 'Scale' },
        unicode: { name: 'Unicode' },
        SRID: { name: 'SRID' }
    }
    
    buildReturnType(xml: Xml.XmlCreator, returnType: Edm.ReturnType){
        if( !returnType || 
            typeof returnType.type === 'undefined') 
            return
        
        var parameterElement = xml.declareElement('ReturnType');
        var type = xml.declareAttribute('Type')
        var nullable = xml.declareAttribute('Nullable')
        
        xml.startElement(parameterElement)
            .addAttribute(type, returnType.type)
            
        if(typeof returnType.nullable !== 'undefined')
            xml.addAttribute(nullable, returnType.nullable.toString())
            
        this.buildAnnotations(xml, returnType.annotations)

        xml.endElementInline();
    }
    

    buildEntityContainer(xml: Xml.XmlCreator, entityContainers: Edm.EntityContainer[]) {
        entityContainers && entityContainers.forEach(entityContainer => {
            var entityContainerElement = xml.declareElement('EntityContainer');
            var name = xml.declareAttribute('Name');

            xml.startElement(entityContainerElement)
                .addAttribute(name, entityContainer.name)

            this.buildEntitySets(xml, entityContainer.entitySets)
            this.buildActionImports(xml, entityContainer.actionImports)
            this.buildFunctionImports(xml, entityContainer.functionImports)

            xml.endElement();
        })
    }

    buildEntitySets(xml: Xml.XmlCreator, entitySets: Edm.EntitySet[]) {
        entitySets && entitySets.forEach(entitySet => {
            var entitySetElement = xml.declareElement('EntitySet');
            var name = xml.declareAttribute('Name');
            var entityType = xml.declareAttribute('EntityType')

            xml.startElement(entitySetElement)
                .addAttribute(name, entitySet.name)
                .addAttribute(entityType, entitySet.entityType);

            this.buildAnnotations(xml, entitySet.annotations)

            xml.endElementInline();
        })
    }
    
    buildActionImports(xml: Xml.XmlCreator, actionImports: Edm.ActionImport[]){
        actionImports && actionImports.forEach(actionImport => {
            var actionImportElement = xml.declareElement('ActionImport');
            var name = xml.declareAttribute('Name')
            var action = xml.declareAttribute('Action')
            
            xml.startElement(actionImportElement)
                .addAttribute(name, actionImport.name)
                .addAttribute(action, actionImport.action)
            
            this.buildAnnotations(xml, actionImport.annotations)

            xml.endElementInline();
        })
    }
    
    buildFunctionImports(xml: Xml.XmlCreator, functionImports: Edm.FunctionImport[]){
        functionImports && functionImports.forEach(functionImport => {
            var FunctionImportElement = xml.declareElement('FunctionImport');
            var name = xml.declareAttribute('Name')
            var func = xml.declareAttribute('Function')
            
            xml.startElement(FunctionImportElement)
                .addAttribute(name, functionImport.name)
                .addAttribute(func, functionImport['function'])
                
            if(typeof functionImport.includeInServiceDocument !== 'undefined')
                xml.addAttribute(xml.declareAttribute('IncludeInServiceDocument'), functionImport.includeInServiceDocument.toString())
            
            this.buildAnnotations(xml, functionImport.annotations)

            xml.endElementInline();
        })
    }
    


    buildSchemaAnnotations(xml: Xml.XmlCreator, schemaAnnotations: Edm.Annotations[]) {
        schemaAnnotations && schemaAnnotations.forEach(schemaAnnotation => {
            var target = xml.declareAttribute('Target');
            var AnnotationsElement = xml.declareElement('Annotations');
            xml.startElement(AnnotationsElement)
                .addAttribute(target, schemaAnnotation.target)

            if (schemaAnnotation.qualifier)
                xml.addAttribute(xml.declareAttribute('Qualifier'), schemaAnnotation.qualifier)

            this.buildAnnotations(xml, schemaAnnotation.annotations)

            xml.endElementInline();
        })
    }

    buildAnnotations(xml: Xml.XmlCreator, annotations: Edm.Annotation[]) {
        annotations && annotations.forEach(annotation => {
            var AnnotationElement = xml.declareElement('Annotation');

            xml.startElement(AnnotationElement)

            var attributes = Object.keys(this.annotationAttributes);
            attributes.forEach(prop => {
                if (typeof annotation[prop] !== 'undefined' && annotation[prop] !== null) {
                    var attr = xml.declareAttribute(this.annotationAttributes[prop].name)
                    xml.addAttribute(attr, annotation[prop].toString());
                }
            });

            var annotConfig = this.annotationTypes[annotation.annotationType]
            if (annotConfig) {
                if (annotConfig.handler) {
                    annotConfig.handler(xml, annotation)
                } else if (annotConfig.valueField) {
                    var value = annotation[annotConfig.valueField]
                    if (Array.isArray(value)) {
                        this.buildCollectionAnnotation(xml, value, annotConfig, annotation)
                    }
                    else if (typeof value !== 'undefined' && value !== null) {
                        var attr = xml.declareAttribute(annotConfig.name)
                        xml.addAttribute(attr, value.toString());
                    }
                }
            }

            xml.endElementInline();
        })
    }

    buildCollectionAnnotation(xml: Xml.XmlCreator, value: any[], annotConfig: any, _: Edm.Annotation) {
        var collectionElement = xml.declareElement('Collection');
        xml.startElement(collectionElement)

        value.forEach(v => {
            var valueElement = xml.declareElement(annotConfig.name);
            xml.startElement(valueElement)
                .addText(v.toString())
                .endElementInline();
        })
        xml.endElementInline();
    }

    annotationAttributes: Object = {
        term: { name: 'Term' },
        qualifier: { name: 'Qualifier' },
        path: { name: 'Path' },
    }
    annotationTypes: Object = {
        Binary: { name: 'Binary', valueField: 'binary' },
        Bool: { name: 'Bool', valueField: 'bool' },
        Date: { name: 'Date', valueField: 'date' },
        DateTimeOffset: { name: 'DateTimeOffset', valueField: 'dateTimeOffset' },
        Decimal: { name: 'Decimal', valueField: 'decimal' },
        Duration: { name: 'Duration', valueField: 'duration' },
        EnumMember: { name: 'EnumMember', valueField: 'enumMember' },
        Float: { name: 'Float', valueField: 'float' },
        Guid: { name: 'Guid', valueField: 'guid' },
        Int: { name: 'Int', valueField: 'int' },
        String: { name: 'String', valueField: 'string' },
        TimeOfDay: { name: 'TimeOfDay', valueField: 'timeOfDay' },
        PropertyPath: { name: 'PropertyPath', valueField: 'propertyPaths' },
        NavigationPropertyPath: { name: 'NavigationPropertyPath', valueField: 'navigationPropertyPaths' },
        AnnotationPath: { name: 'AnnotationPath', valueField: 'annotationPaths' },
        Null: {
            name: 'Null',
            handler: (xml) => {
                var nullElement = xml.declareElement('Null');
                xml.startElement(nullElement)
                xml.endElementInline();
            }
        }
    }
}