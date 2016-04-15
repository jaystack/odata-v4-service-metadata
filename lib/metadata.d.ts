import { Edm } from 'odata-v4-metadata';
import { Request, Response, RequestHandler } from 'express';
export declare class ServiceMetadata {
    static processMetadataJson(json: any): ServiceMetadata;
    static processEdmx(edmx: Edm.Edmx): ServiceMetadata;
    static defineEntities(entityConfig: any): ServiceMetadata;
    private xml;
    constructor(edmx: Edm.Edmx);
    document(format?: string): string;
    requestHandler(format?: string): (req: Request, res: Response, next: RequestHandler) => void;
    toString(): string;
}
