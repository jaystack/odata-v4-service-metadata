export namespace Xml {
    export class XmlCreator {
        elements: Array<XmlNode>
        currentElement: XmlNode
        namespaces: any
        xmlPart: string
        
        constructor () {
            //init
            this.startDocument();
        }
        startDocument () {
            this.elements = [];
            this.namespaces = {};
            this.currentElement = undefined;

            this.xmlPart = '';

            return this;
        }
        endDocument () {
            if (this.elements.length !== 0) {
                this.xmlPart = '<error>invalidXml</error>';
            }

            return this;
        }
        getXmlString () {
            if (this.elements.length !== 0) {
                return '<error>invalidXml</error>';
            }

            return this.xmlPart;
        }

        startElement (element) {
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
        }
        endElement (isInline = false) {
            this.persistNode(this.currentElement, isInline);
            this.currentElement = this.elements.pop();
            return this;
        }
        endElementInline () {
            return this.endElement(true);
        }

        addAttribute (attr, value) {
            attr.Value = value;
            var key = attr.Namespace ? (attr.Name + '_' + attr.Namespace.Name) : attr.Name;
            this.currentElement.Attributes.push(key);
            this.currentElement.Attributes[key] = attr;

            if (attr.Namespace && this.currentElement.InheritedNamespaces.indexOf(attr.Namespace.Name) === -1 && this.currentElement.Namespaces.indexOf(attr.Namespace.Name) === -1) {
                this.currentElement.Namespaces.push(attr.Namespace.Name);
                this.namespaces[attr.Namespace.Name] = attr.Namespace;
            }

            return this;
        }

        addNamespace (namespace) {
            if (this.currentElement.InheritedNamespaces.indexOf(namespace.Name) === -1 && this.currentElement.Namespaces.indexOf(namespace.Name) === -1) {
                this.currentElement.Namespaces.push(namespace.Name);
                this.namespaces[namespace.Name] = namespace;
            }
            return this;
        }

        addText (text) {
            this.currentElement.Text += text;

            return this;
        }

        declareNamespace (schema, schemaName) {
            return new XmlNamespace(schema, schemaName);
        }
        declareElement (namespaceOrName, name?) {
            if (typeof namespaceOrName === 'string') {
                return new XmlElement(namespaceOrName);
            } else {
                return new XmlElement(name, namespaceOrName);
            }
        }
        declareAttribute (namespaceOrName, name?) {
            if (typeof namespaceOrName === 'string') {
                return new XmlAttribute(namespaceOrName);
            } else {
                return new XmlAttribute(name, namespaceOrName);
            }
        }
        persistNode (node, isInline) {
            if (!node.PersistStarted) {
                if (node.Element.Namespace) {
                    var ns = node.Element.Namespace;
                    this.xmlPart += '<' + ns.Name + ':' + node.Element.Name;
                } else {
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
                    } else {
                        this.xmlPart += ' ' + attr.Name + '="' + attr.Value + '"';
                    }
                }

                if (node.HasChild) {
                    this.xmlPart += '>';
                    node.PersistStarted = true;
                } else {
                    if (isInline && !node.Text) {
                        this.xmlPart += '/>';
                    } else {
                        this.xmlPart += '>' + this.escapeText(node.Text);

                        if (node.Element.Namespace) {
                            var ns = node.Element.Namespace;
                            this.xmlPart += '</' + ns.Name + ':' + node.Element.Name + '>';
                        } else {
                            this.xmlPart += '</' + node.Element.Name + '>';
                        }
                    }
                }
            } else {
                if (node.Element.Namespace) {
                    var ns = node.Element.Namespace;
                    this.xmlPart += '</' + ns.Name + ':' + node.Element.Name + '>';
                } else {
                    this.xmlPart += '</' + node.Element.Name + '>';
                }
            }
        }
        escapeText (text) {
            if (text) {
                text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')/*.replace(/"/g, '&quot;').replace(/'/g, '&apos;')*/;
            }
            return text;
        }
    }
    
    export class XmlElement{
        Name: string
        Namespace: XmlNamespace
        
        constructor(name, ns = undefined){
            this.Name = name;
            this.Namespace = ns;
        }
    }
    
    export class XmlNamespace{
        Name: string
        Schema: string
        
        constructor(schema, name = undefined){
            this.Schema = schema;
            this.Name = name;
        }
    }
    
    export class XmlAttribute{
        Name: string
        Namespace: XmlNamespace
        Value: string
        
        constructor(name, ns = undefined, value = undefined) {
            this.Name = name;
            this.Namespace = ns;
            this.Value = value;
        }
    }
    
    export class XmlNode{
        Element: XmlElement
        Attributes: Array<string>
        Text: string

        Namespaces: Array<string>
        InheritedNamespaces: Array<string>
        HasChild: boolean
        PersistStarted: boolean
        
        constructor (element, inherited) {
            this.Element = element;
            this.Attributes = [];
            this.Namespaces =  [];
            this.InheritedNamespaces = inherited;
            this.Text = "";
        }
    }
    
}