import { Edm } from 'odata-metadata'
import { XmlMetadata } from './XmlMetadata'
import { defineEntities } from './defineEntities'
import { Request, Response, RequestHandler } from 'express';

export class ServiceMetadata {
    static processMetadataJson(json) {
        var edmx = new Edm.Edmx(json);
        return new ServiceMetadata(edmx);
    }
    static processEdmx(edmx: Edm.Edmx) {
        return new ServiceMetadata(edmx);
    }
    static defineEntities(entityConfig) {
        var json = defineEntities(entityConfig)
        var edmx = new Edm.Edmx(json);
        return new ServiceMetadata(edmx);
    }

    private xml: string
    constructor(edmx: Edm.Edmx) {
        var xmlMetadata = new XmlMetadata({}, edmx);
        this.xml = xmlMetadata.processMetadata();
    }
    
    document(format?: string) {
        switch (format){
            case 'json':
            case 'application/json':
                throw new Error('Not implemented');
            default: return this.xml;
        }
    }
    
    requestHandler(format?: string) {
        return (req:Request, res:Response, next:RequestHandler) => {
            res.set('Content-Type', 'application/xml');
            res.send(this.document(format));
        };
    }

    toString() {
        return this.xml;
    }
}