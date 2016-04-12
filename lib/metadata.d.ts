import { Edm } from 'odata-metadata';
export declare class Metadata {
    static processMetadataJson(json: any): Metadata;
    static processEdmx(edmx: Edm.Edmx): Metadata;
    static defineEntities(entityConfig: any): Metadata;
    private text;
    constructor(edmx: Edm.Edmx);
    toXml(): string;
}
