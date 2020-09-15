# 🍃 leafy

Creates a JavaScript object representing a directory tree.

## Options

`exclude` : `string|string[]` - A string or an array of string to test for exclusion of elements.

`normalizePath` : `Boolean` - If true, windows style paths will be normalized to unix style paths (/ instead of \\).

`hash` : `Boolean` - If true, add a Hashid (only on files).

`gui` : `Boolean` - If true, display the directory tree in your console.

## Result

Given a directory structured like this:

```
photos
├── summer
│   └── june
│       └── windsurf.jpg
└── winter
    └── january
        ├── ski.png
        └── snowboard.jpg
```

`leafy` will return this JS object:

```json
{
  "path": "photos",
  "name": "photos",
  "size": 600,
  "type": "directory",
  "children": [
    {
      "path": "photos/summer",
      "name": "summer",
      "size": 400,
      "type": "directory",
      "children": [
        {
          "path": "photos/summer/june",
          "name": "june",
          "size": 400,
          "type": "directory",
          "children": [
            {
              "path": "photos/summer/june/windsurf.jpg",
              "name": "windsurf.jpg",
              "size": 400,
              "type": "file",
              "extension": ".jpg"
            }
          ]
        }
      ]
    },
    {
      "path": "photos/winter",
      "name": "winter",
      "size": 200,
      "type": "directory",
      "children": [
        {
          "path": "photos/winter/january",
          "name": "january",
          "size": 200,
          "type": "directory",
          "children": [
            {
              "path": "photos/winter/january/ski.png",
              "name": "ski.png",
              "size": 100,
              "type": "file",
              "extension": ".png"
            },
            {
              "path": "photos/winter/january/snowboard.jpg",
              "name": "snowboard.jpg",
              "size": 100,
              "type": "file",
              "extension": ".jpg"
            }
          ]
        }
      ]
    }
  ]
}
```

## Note

Device, FIFO and socket files are ignored.

Files to which the user does not have permissions are included in the directory
tree, however, directories to which the user does not have permissions, along
with all of its contained files, are completely ignored.
