import { Edm } from 'odata-metadata'
import { XmlMetadata } from './XmlMetadata'
import { defineEntities } from './defineEntities'

export class Metadata {
    static processMetadataJson(json) {
        var edmx = new Edm.Edmx(json);
        return new Metadata(edmx);
    }
    static processEdmx(edmx: Edm.Edmx) {
        return new Metadata(edmx);
    }
    static defineEntities(entityConfig) {
        var json = defineEntities(entityConfig)
        var edmx = new Edm.Edmx(json);
        return new Metadata(edmx);
    }

    private text: string
    constructor(edmx: Edm.Edmx) {
        var xmlMetadata = new XmlMetadata({}, edmx);
        this.text = xmlMetadata.processMetadata();
    }

    toXml() {
        return this.text;
    }
}