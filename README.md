# n8n-nodes-doc-fill

This repo contains two n8n nodes:

* Doc Fill which, given a PDF with a form as input, retrieves the fields based on the given keys and inserts the given value for the retrieved field.
* Doc Create Field which adds a text to a given page's coordinates.

## Doc Fill

Doc Fill takes a PDF as input and 3 parameters: Property Name, Property Name Out, Configuration JSON.

* Property Name should be the internal name representing the PDF file given as input (default is 'data').
* Property Name Out is the internal name you want to give to the output PDF file (default is 'data').
* Configuration JSON is a JSON following the structure given below to specify which fields you want to change.

### Configuration JSON structure

This is the base structure to configure one field, Configuration JSON is expecting an array of this structure.

```typescript
interface DocFillConfig {
    key: string;
    value: string;
    type: 'textfield' | 'checkbox' | 'dropdown' | 'radiogroup';
}
```

* key: The key to find and retrieve the field in the PDF Form.
* value: The value you want to insert for the retrieved field (must be 'true' (check) or 'false' (uncheck) for checkbox field type).
* type: The type of field you want to retrieve (can be 'textfield', 'checkbox', 'dropdown' or 'radiogroup').

### Example

```JSON
[
  {
    "key": "keyOfMyTextField",
    "value": "John Doe",
    "type": "textfield"
  },
  {
    "key": "keyOfMyCheckbox",
    "value": "true",
    "type": "checkbox"
  }
]
```

## Doc Create Field

Doc Create Field takes a PDF as input and 3 parameters: Property Name, Property Name Out, Configuration JSON.

* Property Name should be the internal name representing the PDF file given as input (default is 'data').
* Property Name Out is the internal name you want to give to the output PDF file (default is 'data').
* Configuration JSON is a JSON following the structure given below to specify the text you want to draw and how/where you want to draw it.

### Configuration JSON structure

This is the base structure to draw one text, Configuration JSON is expecting an array of this structure.

```typescript
interface DocCreateFieldConfig {
    page: number,
    value: string;
    options: {
        x: number,
        y: number,
        size: number | undefined,
        opacity: number | undefined,
        colorRed: number | undefined,
        colorGreen: number | undefined,
        colorBlue: number | undefined,
    }
}
```

* page: The page in the PDF on which you want to draw your text.
* value: The text you want to draw.
* options.x: Position on the x axis where you want to start drawing the text.
* options.y: Position on the y axis where you want to start drawing the text.
* options.size: Size of the text you want to draw. (optional, default is 24)
* options.opacity: Opacity of the text you want to draw, must be between 0 and 1. (optional, default is 1)
* options.colorRed: Red value of the RGB color representation. (optional, default is 0)
* options.colorGreen: Green value of the RGB color representation. (optional, default is 0)
* options.colorBlue: Blue value of the RGB color representation. (optional, default is 0)

### Example

```JSON
[
  {
    "page": 0,
    "value": "this is a test!",
    "options": {
      "x": 300,
      "y": 30,
      "size": 12
    }
  }
]
```