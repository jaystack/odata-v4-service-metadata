"use strict";
var extend = require('extend');
var XmlCreator_1 = require('./XmlCreator');
var XmlMetadata = (function () {
    function XmlMetadata(options, edmx) {
        this.typePropertyAttributes = {
            name: { name: 'Name' },
            type: { name: 'Type' },
            nullable: { name: 'Nullable' },
            maxLength: { name: 'MaxLength' },
            precision: { name: 'Precision' },
            scale: { name: 'Scale' },
            unicode: { name: 'Unicode' },
            SRID: { name: 'SRID' },
            defaultValue: { name: 'DefaultValue' }
        };
        this.typeNavigationPropertyAttributes = {
            name: { name: 'Name' },
            type: { name: 'Type' },
            nullable: { name: 'Nullable' },
            containsTarget: { name: 'ContainsTarget' },
            partner: { name: 'Partner' }
        };
        this.typeMemberAttributes = {
            name: { name: 'Name' },
            value: { name: 'Value' }
        };
        this.parameterAttributes = {
            name: { name: 'Name' },
            type: { name: 'Type' },
            nullable: { name: 'Nullable' },
            maxLength: { name: 'MaxLength' },
            precision: { name: 'Precision' },
            scale: { name: 'Scale' },
            unicode: { name: 'Unicode' },
            SRID: { name: 'SRID' }
        };
        this.annotationAttributes = {
            term: { name: 'Term' },
            qualifier: { name: 'Qualifier' },
            path: { name: 'Path' },
        };
        this.annotationTypes = {
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
                handler: function (xml) {
                    var nullElement = xml.declareElement('Null');
                    xml.startElement(nullElement);
                    xml.endElementInline();
                }
            }
        };
        this.options = extend({
            edmx: 'http://docs.oasis-open.org/odata/ns/edmx',
            m: 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
            d: 'http://schemas.microsoft.com/ado/2007/08/dataservices',
            namespace: 'http://docs.oasis-open.org/odata/ns/edm',
            edmxVersion: '4.0',
            xmlHead: '<?xml version="1.0" encoding="UTF-8"?>',
            contextNamespace: 'MyContext'
        }, options);
        this.metadata = edmx;
    }
    XmlMetadata.prototype.processMetadata = function () {
        var xml = new XmlCreator_1.Xml.XmlCreator();
        var xmlResult = this.options.xmlHead;
        xml.startDocument();
        this.buildEdmx(xml, this.metadata);
        xml.endDocument();
        xmlResult += xml.getXmlString();
        return xmlResult;
    };
    XmlMetadata.prototype.buildEdmx = function (xml, edmx) {
        var ns = xml.declareNamespace(this.options.edmx, 'edmx');
        var edmxElement = xml.declareElement(ns, 'Edmx');
        var version = xml.declareAttribute('Version');
        xml.startElement(edmxElement)
            .addAttribute(version, edmx.version || this.options.edmxVersion);
        this.buildDataServices(xml, edmx.dataServices);
        xml.endElement();
    };
    XmlMetadata.prototype.buildDataServices = function (xml, dataservices) {
        var ns = xml.declareNamespace(this.options.edmx, 'edmx');
        var dataservicesElement = xml.declareElement(ns, 'DataServices');
        xml.startElement(dataservicesElement);
        this.buildSchema(xml, dataservices.schemas);
        xml.endElement();
    };
    XmlMetadata.prototype.buildSchema = function (xml, schemas) {
        var _this = this;
        schemas && schemas.forEach(function (schema) {
            var xmlns = xml.declareAttribute('xmlns');
            var schemaElement = xml.declareElement('Schema');
            var ns = xml.declareAttribute('Namespace');
            xml.startElement(schemaElement)
                .addAttribute(xmlns, _this.options.namespace)
                .addAttribute(ns, schema.namespace || _this.options.contextNamespace);
            if (schema.alias)
                xml.addAttribute(xml.declareAttribute('Alias'), schema.alias);
            _this.buildEntityTypes(xml, schema.entityTypes);
            _this.buildComplexTypes(xml, schema.complexTypes);
            _this.buildEnumTypes(xml, schema.enumTypes);
            _this.buildActions(xml, schema.actions);
            _this.buildFunctions(xml, schema.functions);
            _this.buildEntityContainer(xml, schema.entityContainer);
            _this.buildSchemaAnnotations(xml, schema.annotations);
            xml.endElement();
        });
    };
    XmlMetadata.prototype.buildEnumTypes = function (xml, enumTypes) {
        var _this = this;
        enumTypes && enumTypes.forEach(function (enumType) {
            var rootElement = xml.declareElement('EnumType');
            var name = xml.declareAttribute('Name');
            xml.startElement(rootElement)
                .addAttribute(name, enumType.name);
            if (enumType.namespace)
                xml.addAttribute(xml.declareAttribute('Namespace'), enumType.namespace);
            if (enumType.underlyingType)
                xml.addAttribute(xml.declareAttribute('UnderlyingType'), enumType.underlyingType);
            if (enumType.isFlags)
                xml.addAttribute(xml.declareAttribute('IsFlags'), enumType.isFlags);
            _this.buildEnumMembers(xml, enumType.members);
            _this.buildAnnotations(xml, enumType.annotations);
            xml.endElement();
        });
    };
    XmlMetadata.prototype.buildEntityTypes = function (xml, entityTypes) {
        var _this = this;
        entityTypes && entityTypes.forEach(function (entityType) {
            _this.buildType(xml, entityType, 'EntityType');
        });
    };
    XmlMetadata.prototype.buildComplexTypes = function (xml, complexTypes) {
        var _this = this;
        complexTypes && complexTypes.forEach(function (complexType) {
            _this.buildType(xml, complexType, 'ComplexType');
        });
    };
    XmlMetadata.prototype.buildType = function (xml, type, xmlElementName) {
        var rootElement = xml.declareElement(xmlElementName);
        var name = xml.declareAttribute('Name');
        xml.startElement(rootElement)
            .addAttribute(name, type.name);
        if (type.baseType)
            xml.addAttribute(xml.declareAttribute('BaseType'), type.baseType);
        if (type.abstract)
            xml.addAttribute(xml.declareAttribute('Abstract'), type.abstract);
        if (type.openType)
            xml.addAttribute(xml.declareAttribute('OpenType'), type.openType);
        if (type.hasStream)
            xml.addAttribute(xml.declareAttribute('HasStream'), type.hasStream);
        this.buildTypeKeys(xml, type.key);
        this.buildTypeProperties(xml, type.properties);
        this.buildTypeNavigationProperties(xml, type.navigationProperties);
        this.buildAnnotations(xml, type.annotations);
        xml.endElement();
    };
    XmlMetadata.prototype.buildTypeKeys = function (xml, key) {
        if (!key)
            return;
        var keyElement = xml.declareElement('Key');
        var propRef = xml.declareElement('PropertyRef');
        var name = xml.declareAttribute('Name');
        var keys = key.propertyRefs;
        if (keys.length > 0) {
            xml.startElement(keyElement);
            keys.forEach(function (keyDef) {
                xml.startElement(propRef)
                    .addAttribute(name, keyDef.name);
                if (keyDef.alias)
                    xml.addAttribute(xml.declareAttribute('Alias'), keyDef.alias);
                xml.endElementInline();
            });
            xml.endElement();
        }
    };
    XmlMetadata.prototype.buildTypeProperties = function (xml, properties) {
        var _this = this;
        properties && properties.forEach(function (property) {
            var propertyElement = xml.declareElement('Property');
            xml.startElement(propertyElement);
            _this.buildAttributes(xml, property, _this.typePropertyAttributes);
            _this.buildAnnotations(xml, property.annotations);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildTypeNavigationProperties = function (xml, navigationProperties) {
        var _this = this;
        navigationProperties && navigationProperties.forEach(function (navigationProperty) {
            var navigationPropertyElement = xml.declareElement('NavigationProperty');
            xml.startElement(navigationPropertyElement);
            _this.buildAttributes(xml, navigationProperty, _this.typeNavigationPropertyAttributes);
            _this.buildNavPropertyReferentialConstraints(xml, navigationProperty.referentialConstraints);
            _this.buildAnnotations(xml, navigationProperty.annotations);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildNavPropertyReferentialConstraints = function (xml, referentialConstraints) {
        referentialConstraints && referentialConstraints.forEach(function (referentialConstraint) {
            var referentialConstraintElement = xml.declareElement('ReferentialConstraint');
            xml.startElement(referentialConstraintElement);
            if (referentialConstraint.property)
                xml.addAttribute(xml.declareAttribute("Property"), referentialConstraint.property);
            if (referentialConstraint.referencedProperty)
                xml.addAttribute(xml.declareAttribute("ReferencedProperty"), referentialConstraint.referencedProperty);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildEnumMembers = function (xml, members) {
        var _this = this;
        members && members.forEach(function (member) {
            var memberElement = xml.declareElement('Member');
            xml.startElement(memberElement);
            _this.buildAttributes(xml, member, _this.typeMemberAttributes);
            _this.buildAnnotations(xml, member.annotations);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildAttributes = function (xml, object, mappings) {
        var attributes = mappings && Object.keys(mappings);
        object && attributes && attributes.forEach(function (prop) {
            if (typeof object[prop] !== 'undefined' && object[prop] !== null) {
                var attr = xml.declareAttribute(mappings[prop].name);
                xml.addAttribute(attr, object[prop].toString());
            }
        });
    };
    XmlMetadata.prototype.buildActions = function (xml, actions) {
        var _this = this;
        actions && actions.forEach(function (action) {
            var actionElement = xml.declareElement('Action');
            var name = xml.declareAttribute('Name');
            xml.startElement(actionElement)
                .addAttribute(name, action.name);
            if (typeof action.isBound !== 'undefined')
                xml.addAttribute(xml.declareAttribute('IsBound'), action.isBound.toString());
            if (action.entitySetPath)
                xml.addAttribute(xml.declareAttribute('EntitySetPath'), action.entitySetPath);
            _this.buildParameters(xml, action.parameters);
            _this.buildReturnType(xml, action.returnType);
            _this.buildAnnotations(xml, action.annotations);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildFunctions = function (xml, functions) {
        var _this = this;
        functions && functions.forEach(function (func) {
            var funcElement = xml.declareElement('Function');
            var name = xml.declareAttribute('Name');
            xml.startElement(funcElement)
                .addAttribute(name, func.name);
            if (typeof func.isBound !== 'undefined')
                xml.addAttribute(xml.declareAttribute('IsBound'), func.isBound.toString());
            if (func.entitySetPath)
                xml.addAttribute(xml.declareAttribute('EntitySetPath'), func.entitySetPath);
            if (typeof func.isComposable !== 'undefined')
                xml.addAttribute(xml.declareAttribute('IsComposable'), func.isComposable.toString());
            _this.buildParameters(xml, func.parameters);
            _this.buildReturnType(xml, func.returnType);
            _this.buildAnnotations(xml, func.annotations);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildParameters = function (xml, parameters) {
        var _this = this;
        parameters && parameters.forEach(function (parameter) {
            var parameterElement = xml.declareElement('Parameter');
            xml.startElement(parameterElement);
            _this.buildAttributes(xml, parameter, _this.parameterAttributes);
            _this.buildAnnotations(xml, parameter.annotations);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildReturnType = function (xml, returnType) {
        if (!returnType ||
            typeof returnType.type === 'undefined')
            return;
        var parameterElement = xml.declareElement('ReturnType');
        var type = xml.declareAttribute('Type');
        var nullable = xml.declareAttribute('Nullable');
        xml.startElement(parameterElement)
            .addAttribute(type, returnType.type);
        if (typeof returnType.nullable !== 'undefined')
            xml.addAttribute(nullable, returnType.nullable.toString());
        this.buildAnnotations(xml, returnType.annotations);
        xml.endElementInline();
    };
    XmlMetadata.prototype.buildEntityContainer = function (xml, entityContainers) {
        var _this = this;
        entityContainers && entityContainers.forEach(function (entityContainer) {
            var entityContainerElement = xml.declareElement('EntityContainer');
            var name = xml.declareAttribute('Name');
            xml.startElement(entityContainerElement)
                .addAttribute(name, entityContainer.name);
            _this.buildEntitySets(xml, entityContainer.entitySets);
            _this.buildActionImports(xml, entityContainer.actionImports);
            _this.buildFunctionImports(xml, entityContainer.functionImports);
            xml.endElement();
        });
    };
    XmlMetadata.prototype.buildEntitySets = function (xml, entitySets) {
        var _this = this;
        entitySets && entitySets.forEach(function (entitySet) {
            var entitySetElement = xml.declareElement('EntitySet');
            var name = xml.declareAttribute('Name');
            var entityType = xml.declareAttribute('EntityType');
            xml.startElement(entitySetElement)
                .addAttribute(name, entitySet.name)
                .addAttribute(entityType, entitySet.entityType);
            _this.buildAnnotations(xml, entitySet.annotations);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildActionImports = function (xml, actionImports) {
        var _this = this;
        actionImports && actionImports.forEach(function (actionImport) {
            var actionImportElement = xml.declareElement('ActionImport');
            var name = xml.declareAttribute('Name');
            var action = xml.declareAttribute('Action');
            xml.startElement(actionImportElement)
                .addAttribute(name, actionImport.name)
                .addAttribute(action, actionImport.action);
            _this.buildAnnotations(xml, actionImport.annotations);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildFunctionImports = function (xml, functionImports) {
        var _this = this;
        functionImports && functionImports.forEach(function (functionImport) {
            var FunctionImportElement = xml.declareElement('FunctionImport');
            var name = xml.declareAttribute('Name');
            var func = xml.declareAttribute('Function');
            xml.startElement(FunctionImportElement)
                .addAttribute(name, functionImport.name)
                .addAttribute(func, functionImport['function']);
            if (typeof functionImport.includeInServiceDocument !== 'undefined')
                xml.addAttribute(xml.declareAttribute('IncludeInServiceDocument'), functionImport.includeInServiceDocument.toString());
            _this.buildAnnotations(xml, functionImport.annotations);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildSchemaAnnotations = function (xml, schemaAnnotations) {
        var _this = this;
        schemaAnnotations && schemaAnnotations.forEach(function (schemaAnnotation) {
            var target = xml.declareAttribute('Target');
            var AnnotationsElement = xml.declareElement('Annotations');
            xml.startElement(AnnotationsElement)
                .addAttribute(target, schemaAnnotation.target);
            if (schemaAnnotation.qualifier)
                xml.addAttribute(xml.declareAttribute('Qualifier'), schemaAnnotation.qualifier);
            _this.buildAnnotations(xml, schemaAnnotation.annotations);
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildAnnotations = function (xml, annotations) {
        var _this = this;
        annotations && annotations.forEach(function (annotation) {
            var AnnotationElement = xml.declareElement('Annotation');
            xml.startElement(AnnotationElement);
            var attributes = Object.keys(_this.annotationAttributes);
            attributes.forEach(function (prop) {
                if (typeof annotation[prop] !== 'undefined' && annotation[prop] !== null) {
                    var attr = xml.declareAttribute(_this.annotationAttributes[prop].name);
                    xml.addAttribute(attr, annotation[prop].toString());
                }
            });
            var annotConfig = _this.annotationTypes[annotation.annotationType];
            if (annotConfig) {
                if (annotConfig.handler) {
                    annotConfig.handler(xml, annotation);
                }
                else if (annotConfig.valueField) {
                    var value = annotation[annotConfig.valueField];
                    if (Array.isArray(value)) {
                        _this.buildCollectionAnnotation(xml, value, annotConfig, annotation);
                    }
                    else if (typeof value !== 'undefined' && value !== null) {
                        var attr = xml.declareAttribute(annotConfig.name);
                        xml.addAttribute(attr, value.toString());
                    }
                }
            }
            xml.endElementInline();
        });
    };
    XmlMetadata.prototype.buildCollectionAnnotation = function (xml, value, annotConfig, annotation) {
        var collectionElement = xml.declareElement('Collection');
        xml.startElement(collectionElement);
        value.forEach(function (v) {
            var valueElement = xml.declareElement(annotConfig.name);
            xml.startElement(valueElement)
                .addText(v.toString())
                .endElementInline();
        });
        xml.endElementInline();
    };
    return XmlMetadata;
}());
exports.XmlMetadata = XmlMetadata;
//# sourceMappingURL=XmlMetadata.js.map