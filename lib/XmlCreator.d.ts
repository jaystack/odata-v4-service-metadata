export declare namespace Xml {
    class XmlCreator {
        elements: Array<XmlNode>;
        currentElement: XmlNode;
        namespaces: any;
        xmlPart: string;
        constructor();
        startDocument(): this;
        endDocument(): this;
        getXmlString(): string;
        startElement(element: any): this;
        endElement(isInline: any): this;
        endElementInline(): this;
        addAttribute(attr: any, value: any): this;
        addNamespace(namespace: any): this;
        addText(text: any): this;
        declareNamespace(schema: any, schemaName: any): XmlNamespace;
        declareElement(namespaceOrName: any, name: any): XmlElement;
        declareAttribute(namespaceOrName: any, name: any): XmlAttribute;
        persistNode(node: any, isInline: any): void;
        escapeText(text: any): any;
    }
    class XmlElement {
        Name: string;
        Namespace: XmlNamespace;
        constructor(name: any, ns?: any);
    }
    class XmlNamespace {
        Name: string;
        Schema: string;
        constructor(schema: any, name?: any);
    }
    class XmlAttribute {
        Name: string;
        Namespace: XmlNamespace;
        Value: string;
        constructor(name: any, ns?: any, value?: any);
    }
    class XmlNode {
        Element: XmlElement;
        Attributes: Array<string>;
        Text: string;
        Namespaces: Array<string>;
        InheritedNamespaces: Array<string>;
        HasChild: boolean;
        PersistStarted: boolean;
        constructor(element: any, inherited: any);
    }
}
