var odata_metadata_1 = require('odata-metadata');
var XmlMetadata_1 = require('./XmlMetadata');
var defineEntities_1 = require('./defineEntities');
var Metadata = (function () {
    function Metadata(edmx) {
        var xmlMetadata = new XmlMetadata_1.XmlMetadata({}, edmx);
        this.text = xmlMetadata.processMetadata();
    }
    Metadata.processMetadataJson = function (json) {
        var edmx = new odata_metadata_1.Edm.Edmx(json);
        return new Metadata(edmx);
    };
    Metadata.processEdmx = function (edmx) {
        return new Metadata(edmx);
    };
    Metadata.defineEntities = function (entityConfig) {
        var json = defineEntities_1.defineEntities(entityConfig);
        var edmx = new odata_metadata_1.Edm.Edmx(json);
        return new Metadata(edmx);
    };
    Metadata.prototype.toXml = function () {
        return this.text;
    };
    return Metadata;
})();
exports.Metadata = Metadata;
//# sourceMappingURL=metadata.js.map