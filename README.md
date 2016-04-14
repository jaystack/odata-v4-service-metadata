# OData v4 $metadata

Using this module you can generate a $metadata XML response from a simple JSON format, an advanced schema JSON format or an Edmx instance created with [odata-metadata](https://github.com/jaystack/odata-metadata).

## Basic usage

Use the simple JSON format and convert your metadata JSON to XML format with ```.toXml()```.

```javascript
var Metadata = require('odata-v4-metadata-xml').Metadata;
var metadata = Metadata.defineEntities({
    namespace: 'Default',
    containerName: 'Container',
    entities: [
        {
            name: 'Kitten',
            collectionName: 'Kittens',
            keys: ['Id'],
            computedKey: true,
            properties: {
                Id: 'Edm.String',
                Name: 'Edm.String',
                Age: 'Edm.Int32',
                Lives: 'Edm.Int32',
                Owner: 'Edm.String'
            },
            annotations:[
                { name: 'UI.DisplayName', value: 'Meww' },
                { property: 'Id', name: 'UI.ReadOnly', value: 'true' },
                { property: 'Title', name: 'UI.DisplayName', value: 'Meww Meww' },
            ]
        }
    ]
});
var metadataXml = metadata.toXml();

// $metadata express.js route
app.get('/odata/\\$metadata', function(req, res, next){
	res.set('Content-Type', 'application/xml');
    res.send(metadataXml);
});
```

## Advanced usage

Use a schema JSON, which is more verbose, but you can customize the metadata in a more advanced way.

```javascript
var Metadata = require('odata-v4-metadata-xml').Metadata;
var schema = require('./schema');
var metadata = Metadata.processMetadataJson(schema);
var metadataXml = metadata.toXml();
```

An example schema JSON looks like [this](https://raw.githubusercontent.com/jaystack/odata-v4-metadata-xml/master/tests/schema2.json)
