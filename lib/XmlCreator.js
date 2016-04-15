"use strict";
var Xml;
(function (Xml) {
    var XmlCreator = (function () {
        function XmlCreator() {
            //init
            this.startDocument();
        }
        XmlCreator.prototype.startDocument = function () {
            this.elements = [];
            this.namespaces = {};
            this.currentElement = undefined;
            this.xmlPart = '';
            return this;
        };
        XmlCreator.prototype.endDocument = function () {
            if (this.elements.length !== 0) {
                this.xmlPart = '<error>invalidXml</error>';
            }
            return this;
        };
        XmlCreator.prototype.getXmlString = function () {
            if (this.elements.length !== 0) {
                return '<error>invalidXml</error>';
            }
            return this.xmlPart;
        };
        XmlCreator.prototype.startElement = function (element) {
            if (this.currentElement) {
                this.currentElement.HasChild = true;
                this.elements.push(this.currentElement);
                if (!this.currentElement.PersistStarted)
                    this.persistNode(this.currentElement, true);
            }
            var inheritedNamespaces = this.currentElement ? [].concat(this.currentElement.InheritedNamespaces, this.currentElement.Namespaces) : [];
            this.currentElement = new XmlNode(element, inheritedNamespaces);
            if (element.Namespace && this.currentElement.InheritedNamespaces.indexOf(element.Namespace.Name) === -1) {
                this.currentElement.Namespaces.push(element.Namespace.Name);
                this.namespaces[element.Namespace.Name] = element.Namespace;
            }
            return this;
        };
        XmlCreator.prototype.endElement = function (isInline) {
            this.persistNode(this.currentElement, isInline);
            this.currentElement = this.elements.pop();
            return this;
        };
        XmlCreator.prototype.endElementInline = function () {
            return this.endElement(true);
        };
        XmlCreator.prototype.addAttribute = function (attr, value) {
            attr.Value = value;
            var key = attr.Namespace ? (attr.Name + '_' + attr.Namespace.Name) : attr.Name;
            this.currentElement.Attributes.push(key);
            this.currentElement.Attributes[key] = attr;
            if (attr.Namespace && this.currentElement.InheritedNamespaces.indexOf(attr.Namespace.Name) === -1 && this.currentElement.Namespaces.indexOf(attr.Namespace.Name) === -1) {
                this.currentElement.Namespaces.push(attr.Namespace.Name);
                this.namespaces[attr.Namespace.Name] = attr.Namespace;
            }
            return this;
        };
        XmlCreator.prototype.addNamespace = function (namespace) {
            if (this.currentElement.InheritedNamespaces.indexOf(namespace.Name) === -1 && this.currentElement.Namespaces.indexOf(namespace.Name) === -1) {
                this.currentElement.Namespaces.push(namespace.Name);
                this.namespaces[namespace.Name] = namespace;
            }
            return this;
        };
        XmlCreator.prototype.addText = function (text) {
            this.currentElement.Text += text;
            return this;
        };
        XmlCreator.prototype.declareNamespace = function (schema, schemaName) {
            return new XmlNamespace(schema, schemaName);
        };
        XmlCreator.prototype.declareElement = function (namespaceOrName, name) {
            if (typeof namespaceOrName === 'string') {
                return new XmlElement(namespaceOrName);
            }
            else {
                return new XmlElement(name, namespaceOrName);
            }
        };
        XmlCreator.prototype.declareAttribute = function (namespaceOrName, name) {
            if (typeof namespaceOrName === 'string') {
                return new XmlAttribute(namespaceOrName);
            }
            else {
                return new XmlAttribute(name, namespaceOrName);
            }
        };
        XmlCreator.prototype.persistNode = function (node, isInline) {
            if (!node.PersistStarted) {
                if (node.Element.Namespace) {
                    var ns = node.Element.Namespace;
                    this.xmlPart += '<' + ns.Name + ':' + node.Element.Name;
                }
                else {
                    this.xmlPart += '<' + node.Element.Name;
                }
                for (var i = 0; i < node.Namespaces.length; i++) {
                    var ns = this.namespaces[node.Namespaces[i]];
                    this.xmlPart += ' xmlns:' + ns.Name + '="' + ns.Schema + '"';
                }
                var attrs = node.Attributes;
                for (var i = 0; i < attrs.length; i++) {
                    var attrName = node.Attributes[i];
                    var attr = node.Attributes[attrName];
                    if (attr.Namespace) {
                        this.xmlPart += ' ' + attr.Namespace.Name + ':' + attr.Name + '="' + attr.Value + '"';
                    }
                    else {
                        this.xmlPart += ' ' + attr.Name + '="' + attr.Value + '"';
                    }
                }
                if (node.HasChild) {
                    this.xmlPart += '>';
                    node.PersistStarted = true;
                }
                else {
                    if (isInline && !node.Text) {
                        this.xmlPart += '/>';
                    }
                    else {
                        this.xmlPart += '>' + this.escapeText(node.Text);
                        if (node.Element.Namespace) {
                            var ns = node.Element.Namespace;
                            this.xmlPart += '</' + ns.Name + ':' + node.Element.Name + '>';
                        }
                        else {
                            this.xmlPart += '</' + node.Element.Name + '>';
                        }
                    }
                }
            }
            else {
                if (node.Element.Namespace) {
                    var ns = node.Element.Namespace;
                    this.xmlPart += '</' + ns.Name + ':' + node.Element.Name + '>';
                }
                else {
                    this.xmlPart += '</' + node.Element.Name + '>';
                }
            }
        };
        XmlCreator.prototype.escapeText = function (text) {
            if (text) {
                text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') /*.replace(/"/g, '&quot;').replace(/'/g, '&apos;')*/;
            }
            return text;
        };
        return XmlCreator;
    }());
    Xml.XmlCreator = XmlCreator;
    var XmlElement = (function () {
        function XmlElement(name, ns) {
            if (ns === void 0) { ns = undefined; }
            this.Name = name;
            this.Namespace = ns;
        }
        return XmlElement;
    }());
    Xml.XmlElement = XmlElement;
    var XmlNamespace = (function () {
        function XmlNamespace(schema, name) {
            if (name === void 0) { name = undefined; }
            this.Schema = schema;
            this.Name = name;
        }
        return XmlNamespace;
    }());
    Xml.XmlNamespace = XmlNamespace;
    var XmlAttribute = (function () {
        function XmlAttribute(name, ns, value) {
            if (ns === void 0) { ns = undefined; }
            if (value === void 0) { value = undefined; }
            this.Name = name;
            this.Namespace = ns;
            this.Value = value;
        }
        return XmlAttribute;
    }());
    Xml.XmlAttribute = XmlAttribute;
    var XmlNode = (function () {
        function XmlNode(element, inherited) {
            this.Element = element;
            this.Attributes = [];
            this.Namespaces = [];
            this.InheritedNamespaces = inherited;
            this.Text = "";
        }
        return XmlNode;
    }());
    Xml.XmlNode = XmlNode;
})(Xml = exports.Xml || (exports.Xml = {}));
//# sourceMappingURL=XmlCreator.js.map