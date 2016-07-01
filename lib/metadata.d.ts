import { Edm } from 'odata-v4-metadata';
import { Request, Response, RequestHandler } from 'express';
export declare class ServiceMetadata {
    static processMetadataJson(json: any, options?: Object): ServiceMetadata;
    static processEdmx(edmx: Edm.Edmx, options?: Object): ServiceMetadata;
    static defineEntities(entityConfig: Object, options?: Object): ServiceMetadata;
    edmx: Edm.Edmx;
    protected data: any;
    constructor(edmx: Edm.Edmx, options?: Object);
    document(format?: string): any;
    process(edmx: Edm.Edmx, options?: Object): void;
    requestHandler(format?: string): (req: Request, res: Response, next: RequestHandler) => void;
    valueOf(): any;
}
