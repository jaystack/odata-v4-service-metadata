"use strict";
var odata_v4_metadata_1 = require('odata-v4-metadata');
var XmlMetadata_1 = require('./XmlMetadata');
var defineEntities_1 = require('./defineEntities');
var ServiceMetadata = (function () {
    function ServiceMetadata(edmx) {
        var xmlMetadata = new XmlMetadata_1.XmlMetadata({}, edmx);
        this.xml = xmlMetadata.processMetadata();
    }
    ServiceMetadata.processMetadataJson = function (json) {
        var edmx = new odata_v4_metadata_1.Edm.Edmx(json);
        return new ServiceMetadata(edmx);
    };
    ServiceMetadata.processEdmx = function (edmx) {
        return new ServiceMetadata(edmx);
    };
    ServiceMetadata.defineEntities = function (entityConfig) {
        var json = defineEntities_1.defineEntities(entityConfig);
        var edmx = new odata_v4_metadata_1.Edm.Edmx(json);
        return new ServiceMetadata(edmx);
    };
    ServiceMetadata.prototype.document = function (format) {
        switch (format) {
            case 'json':
            case 'application/json':
                throw new Error('Not implemented');
            default: return this.xml;
        }
    };
    ServiceMetadata.prototype.requestHandler = function (format) {
        var _this = this;
        return function (req, res, next) {
            res.set('Content-Type', 'application/xml');
            res.send(_this.document(format));
        };
    };
    ServiceMetadata.prototype.toString = function () {
        return this.xml;
    };
    return ServiceMetadata;
}());
exports.ServiceMetadata = ServiceMetadata;
//# sourceMappingURL=metadata.js.map