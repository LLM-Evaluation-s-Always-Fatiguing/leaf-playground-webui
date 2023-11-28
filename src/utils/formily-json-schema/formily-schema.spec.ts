import {test} from "@jest/globals";
import {deReferenceJSONSchema} from "@/utils/json-schema";
import {FormilySchemaTransformer} from "@/utils/formily-json-schema/formily-schema";


const SIMPLE_SCHEMA = `{
        "$defs": {
            "EnvVarsConfig": {
                "properties": {},
                "title": "EnvVarsConfig",
                "type": "object"
            }
        },
        "properties": {
            "environments": {
                "$ref": "#/$defs/EnvVarsConfig"
            }
        },
        "required": [
            "environments"
        ],
        "title": "SceneInfoConfigTemp",
        "type": "object"
    }`;

test('simple transform', async () => {

    const transformer = new FormilySchemaTransformer();

    const result = await transformer.transform(JSON.parse(SIMPLE_SCHEMA));

    console.log(JSON.stringify(result, null, 2));
});


const COMPLEX_SCHEMA = `{
    "$defs": {
        "Audio": {
            "properties": {},
            "title": "Audio",
            "type": "object"
        },
        "AudioMessage": {
            "properties": {
                "sender": {
                    "$ref": "#/$defs/Profile"
                },
                "content": {
                    "$ref": "#/$defs/Audio"
                },
                "receivers": {
                    "items": {
                        "$ref": "#/$defs/Profile"
                    },
                    "title": "Receivers",
                    "type": "array"
                },
                "created_at": {
                    "format": "date-time",
                    "title": "Created At",
                    "type": "string"
                }
            },
            "required": [
                "sender",
                "content",
                "receivers"
            ],
            "title": "AudioMessage",
            "type": "object"
        },
        "DynamicObject": {
            "properties": {
                "obj": {
                    "title": "Obj",
                    "type": "string"
                },
                "module": {
                    "anyOf": [
                        {
                            "type": "string"
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "title": "Module"
                },
                "source_file": {
                    "anyOf": [
                        {
                            "format": "file-path",
                            "type": "string"
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null,
                    "title": "Source File"
                }
            },
            "required": [
                "obj"
            ],
            "title": "DynamicObject",
            "type": "object"
        },
        "Image": {
            "properties": {},
            "title": "Image",
            "type": "object"
        },
        "ImageMessage": {
            "properties": {
                "sender": {
                    "$ref": "#/$defs/Profile"
                },
                "content": {
                    "$ref": "#/$defs/Image"
                },
                "receivers": {
                    "items": {
                        "$ref": "#/$defs/Profile"
                    },
                    "title": "Receivers",
                    "type": "array"
                },
                "created_at": {
                    "format": "date-time",
                    "title": "Created At",
                    "type": "string"
                }
            },
            "required": [
                "sender",
                "content",
                "receivers"
            ],
            "title": "ImageMessage",
            "type": "object"
        },
        "Json": {
            "properties": {},
            "title": "Json",
            "type": "object"
        },
        "JsonMessage": {
            "properties": {
                "sender": {
                    "$ref": "#/$defs/Profile"
                },
                "content": {
                    "$ref": "#/$defs/Json"
                },
                "receivers": {
                    "items": {
                        "$ref": "#/$defs/Profile"
                    },
                    "title": "Receivers",
                    "type": "array"
                },
                "created_at": {
                    "format": "date-time",
                    "title": "Created At",
                    "type": "string"
                }
            },
            "required": [
                "sender",
                "content",
                "receivers"
            ],
            "title": "JsonMessage",
            "type": "object"
        },
        "Media": {
            "properties": {},
            "title": "Media",
            "type": "object"
        },
        "MediaType": {
            "enum": [
                "text",
                "json",
                "image",
                "audio",
                "video"
            ],
            "title": "MediaType",
            "type": "string"
        },
        "Profile": {
            "properties": {
                "id": {
                    "format": "uuid",
                    "title": "Id",
                    "type": "string"
                },
                "name": {
                    "title": "Name",
                    "type": "string"
                },
                "role": {
                    "anyOf": [
                        {
                            "$ref": "#/$defs/Role"
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null
                }
            },
            "required": [
                "name"
            ],
            "title": "Profile",
            "type": "object"
        },
        "Role": {
            "properties": {
                "name": {
                    "title": "Name",
                    "type": "string"
                },
                "description": {
                    "title": "Description",
                    "type": "string"
                },
                "is_static": {
                    "default": false,
                    "title": "Is Static",
                    "type": "boolean"
                },
                "agent_type": {
                    "anyOf": [
                        {
                            "$ref": "#/$defs/DynamicObject"
                        },
                        {
                            "type": "null"
                        }
                    ],
                    "default": null
                }
            },
            "required": [
                "name",
                "description"
            ],
            "title": "Role",
            "type": "object"
        },
        "Text": {
            "properties": {
                "text": {
                    "title": "Text",
                    "type": "string"
                }
            },
            "required": [
                "text"
            ],
            "title": "Text",
            "type": "object"
        },
        "TextMessage": {
            "properties": {
                "sender": {
                    "$ref": "#/$defs/Profile"
                },
                "content": {
                    "$ref": "#/$defs/Text"
                },
                "receivers": {
                    "items": {
                        "$ref": "#/$defs/Profile"
                    },
                    "title": "Receivers",
                    "type": "array"
                },
                "created_at": {
                    "format": "date-time",
                    "title": "Created At",
                    "type": "string"
                }
            },
            "required": [
                "sender",
                "content",
                "receivers"
            ],
            "title": "TextMessage",
            "type": "object"
        },
        "Video": {
            "properties": {},
            "title": "Video",
            "type": "object"
        },
        "VideoMessage": {
            "properties": {
                "sender": {
                    "$ref": "#/$defs/Profile"
                },
                "content": {
                    "$ref": "#/$defs/Video"
                },
                "receivers": {
                    "items": {
                        "$ref": "#/$defs/Profile"
                    },
                    "title": "Receivers",
                    "type": "array"
                },
                "created_at": {
                    "format": "date-time",
                    "title": "Created At",
                    "type": "string"
                }
            },
            "required": [
                "sender",
                "content",
                "receivers"
            ],
            "title": "VideoMessage",
            "type": "object"
        }
    },
    "properties": {
        "index": {
            "title": "Index",
            "type": "integer"
        },
        "created_at": {
            "format": "date-time",
            "title": "Created At",
            "type": "string"
        },
        "references": {
            "anyOf": [
                {
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "#/$defs/TextMessage"
                            },
                            {
                                "$ref": "#/$defs/JsonMessage"
                            },
                            {
                                "$ref": "#/$defs/ImageMessage"
                            },
                            {
                                "$ref": "#/$defs/AudioMessage"
                            },
                            {
                                "$ref": "#/$defs/VideoMessage"
                            }
                        ]
                    },
                    "type": "array"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "title": "References"
        },
        "response": {
            "anyOf": [
                {
                    "$ref": "#/$defs/TextMessage"
                },
                {
                    "$ref": "#/$defs/JsonMessage"
                },
                {
                    "$ref": "#/$defs/ImageMessage"
                },
                {
                    "$ref": "#/$defs/AudioMessage"
                },
                {
                    "$ref": "#/$defs/VideoMessage"
                }
            ],
            "title": "Response"
        },
        "media_type": {
            "$ref": "#/$defs/MediaType"
        },
        "ground_truth": {
            "anyOf": [
                {
                    "$ref": "#/$defs/Media"
                },
                {
                    "type": "null"
                }
            ],
            "default": null
        },
        "eval_result": {
            "anyOf": [
                {
                    "additionalProperties": {
                        "anyOf": [
                            {
                                "type": "boolean"
                            },
                            {
                                "type": "number"
                            },
                            {
                                "type": "string"
                            }
                        ]
                    },
                    "type": "object"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "title": "Eval Result"
        },
        "narrator": {
            "anyOf": [
                {
                    "type": "string"
                },
                {
                    "type": "null"
                }
            ],
            "default": null,
            "title": "Narrator"
        }
    },
    "required": [
        "index",
        "response",
        "media_type"
    ],
    "title": "LogBody",
    "type": "object"
}`

test('complex transform', async () => {

    const transformer = new FormilySchemaTransformer();

    const result = await transformer.transform(JSON.parse(COMPLEX_SCHEMA));

    console.log(JSON.stringify(result, null, 2));
});
