"use strict";
var odata_v4_metadata_1 = require('odata-v4-metadata');
var XmlMetadata_1 = require('./XmlMetadata');
var defineEntities_1 = require('./defineEntities');
var ServiceMetadata = (function () {
    function ServiceMetadata(edmx, options) {
        this.process(edmx, options);
    }
    ServiceMetadata.processMetadataJson = function (json, options) {
        var edmx = new odata_v4_metadata_1.Edm.Edmx(json);
        return new this(edmx, options);
    };
    ServiceMetadata.processEdmx = function (edmx, options) {
        return new this(edmx, options);
    };
    ServiceMetadata.defineEntities = function (entityConfig, options) {
        var json = defineEntities_1.defineEntities(entityConfig);
        var edmx = new odata_v4_metadata_1.Edm.Edmx(json);
        return new this(edmx, options);
    };
    ServiceMetadata.prototype.document = function (format) {
        switch (format) {
            case 'json':
            case 'application/json':
                throw new Error('Not implemented');
            default: return this.data;
        }
    };
    ServiceMetadata.prototype.process = function (edmx, options) {
        var xmlMetadata = new XmlMetadata_1.XmlMetadata(options, edmx);
        this.data = xmlMetadata.processMetadata();
    };
    ServiceMetadata.prototype.requestHandler = function (format) {
        var _this = this;
        return function (req, res, next) {
            res.set('Content-Type', 'application/xml');
            res.send(_this.document(format));
        };
    };
    ServiceMetadata.prototype.valueOf = function () {
        return this.data;
    };
    return ServiceMetadata;
}());
exports.ServiceMetadata = ServiceMetadata;
//# sourceMappingURL=metadata.js.map