# Ace-diff

This is a wrapper for [Ace Editor](http://ace.c9.io/) to provide a 2-panel diffing/merging tool that visualizes differences in two documents and allows users to copy changes from to the other.

![Ace-diff demo](https://ace-diff.github.io/ace-diff/demos/screenshot1.png)

It's built on top of [google-diff-match-patch](https://code.google.com/p/google-diff-match-patch/) library. That lib handles the hard part: the computation of the document diffs. Ace-diff just visualizes that information as line-diffs in the editors.

## Dependencies
- Ace Editor: this could the [official Ace builds](https://github.com/ajaxorg/ace-builds), [Brace](https://github.com/thlorenz/brace) and any other similar Ace editor build (like the ones from public CDNs)

## Demos
Take a look at [demos on Ace-diff page](https://ace-diff.github.io/ace-diff/). The demos illustrate a few different configurations and styles. Hopefully they'll give you a rough sense of what it does and how it works.

## Features

- Compatible with any Ace/Brace Editor mode or theme
- Accommodates realtime changes to one or both editors
- Readonly option for left/right editors
- Control how aggressively diffs are combined
- Allow users to copy diffs from one side to the other

## How to install

```bash
npm i ace-diff -S

…

yarn add ace-diff
```

```js
import AceDiff from 'ace-diff';

// optionally, include CSS, or use your own
import 'ace-diff/dist/ace-diff.min.css';
// Or use the dark mode
import 'ace-diff/dist/ace-diff-dark.min.css';
```

### Use CDN
Grab ace-diff from CDN:

```html
<!-- Inlude Ace Editor - e.g. with this: -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.11/ace.js"></script>

<script src="https://unpkg.com/ace-diff@^3.0.0"></script>

<!-- optionally include CSS, or use your own -->
<link href="https://unpkg.com/ace-diff@^3.0.0/dist/ace-diff.min.css" rel="stylesheet">

<!-- optionally there is also a dark mode CSS -->
<link href="https://unpkg.com/ace-diff@^3.0.0/dist/ace-diff-dark.min.css" rel="stylesheet">
```

### HTML

```html
<div class="acediff"></div>
```

### JavaScript
Here's an example of how you'd instantiate AceDiff.

```js
const differ = new AceDiff({
  ace: window.ace, // You Ace Editor instance
  element: '.acediff',
  left: {
    content: 'your first file content here',
  },
  right: {
    content: 'your second file content here',
  },
});
```

When using with Brace or any build system like Webpack, you can pass the editor as an option:

```js
// If you are using Brace editor, you can pass it as well
const ace = require('brace');

const differ = new AceDiff({
  ace, // using Brace
  element: '.acediff',
  left: {
    content: 'your first file content here',
  },
  right: {
    content: 'your second file content here',
  },
});
```

### CSS

**Because of the way how ACE is positioned, it's important to have Ace-diff running in some container with specified dimensions (and optionally with a `position: relative`)**

Styling the elements is vitally important: the gutter should retain its width even if the user resizes his or her browser. But honestly, how you go about that is very much up to you: you can provide whatever CSS you want, depending on your scenario.

If you want the ace editor's to change height/width based on a user's browser, I find using flexbox the best option - but hell, if you want to use a `<table>`, knock yourself out. :)

Take a look at the [demos](https://ace-diff.github.io/ace-diff/) for some ideas. They all use flexbox for the layouts, but include some different styles and class names just so you can see.


## Configuration

You can configure your Ace-diff instance through a number of config settings. This object is what you pass to the constructor, like the **JavaScript** section above.


### Default settings

Here are all the defaults. I'll explain each one in details below. Note: you only need to override whatever you want.

```javascript
{
  ace: window.ace,
  mode: null,
  theme: null,
  element: null,
  diffGranularity: 'broad',
  showDiffs: true,
  showConnectors: true,
  maxDiffs: 5000,
  left: {
    content: null,
    mode: null,
    theme: null,
    editable: true,
    copyLinkEnabled: true
  },
  right: {
    content: null,
    mode: null,
    theme: null,
    editable: true,
    copyLinkEnabled: true
  },
  classes: {
    diff: 'acediff__diffLine',
    connector: 'acediff__connector',
    newCodeConnectorLinkContent: '&#8594;',
    deletedCodeConnectorLinkContent: '&#8592;',
  },
}
```


### Diffing settings

- `ace` (object, optional, default: `window.ace`). The Ace Editor instance to use.
- `element` (string<DOM selector> or element object, required). The element used for Ace-diff
- `mode` (string, optional). this is the mode for the Ace Editor, e.g. `"ace/mode/javascript"`. Check out the Ace docs for that. This setting will be applied to both editors. I figured 99.999999% of the time you're going to want the same mode for both of them so you can just set it once here. If you're a mad genius and want to have different modes for each side, (a) *whoah man, what's your use-case?*, and (b) you can override this setting in one of the settings below. Read on.
- `theme` (string, optional). This lets you set the theme for both editors.
- `diffGranularity` (string, optional, default: `broad`). this has two options (`specific`, and `broad`). Basically this determines how aggressively AceDiff combines diffs to simplify the interface. I found that often it's a judgement call as to whether multiple diffs on one side should be grouped. This setting provides a little control over it.
- `showDiffs` (boolean, optional, default: `true`). Whether or not the diffs are enabled. This basically turns everything off.
- `showConnectors` (boolean, optional, default: `true`). Whether or not the gutter in the middle show show connectors visualizing where the left and right changes map to one another.
- `maxDiffs` (integer, optional, default: `5000`). This was added a safety precaution. For really massive files with vast numbers of diffs, it's possible the Ace instances or AceDiff will become too laggy. This simply disables the diffing altogether once you hit a certain number of diffs.
- `left/right`. this object contains settings specific to the leftmost editor.
- `left.content / right.content` (string, optional, default: `null`). If you like, when you instantiate AceDiff you can include the content that should appear in the leftmost editor via this property.
- `left.mode / right.mode` (string, optional, defaults to whatever you entered in `mode`). This lets you override the default Ace Editor mode specified in `mode`.
- `left.theme / right.theme` (string, optional, defaults to whatever you entered in `theme`). This lets you override the default Ace Editor theme specified in `theme`.
- `left.editable / right.editable` (boolean, optional, default: `true`). Whether the left editor is editable or not.
- `left.copyLinkEnabled / right.copyLinkEnabled` (boolean, optional, default: `true`). Whether the copy to right/left arrows should appear.


### Classes
- `diff`: the class for a diff line on either editor
- `connector`: the SVG connector
- `newCodeConnectorLinkContent`: the content of the copy to right link. Defaults to a unicode right arrow ('&#8594;')
- `deletedCodeConnectorLinkContent`: the content of the copy to left link. Defaults to a unicode right arrow ('&#8592;')


## API

There are a few API methods available on your AceDiff instance.

- `aceInstance.getEditors()`: this returns an object with left and right properties. Each contains a reference to the Ace editor, in case you need to do anything with them. Ace has a ton of options which I wasn't going to support via the wrapper. This should allow you to do whatever you need
- `aceInstance.setOptions()`: this lets you set many of the above options on the fly. Note: certain things used during the construction of the editor, like the classes can't be overridden.
- `aceInstance.getNumDiffs()`: returns the number of diffs currently being displayed.
- `aceInstance.diff()`: updates the diff. This shouldn't ever be required because AceDiff automatically recognizes the key events like changes to the editor and window resizing. But I've included it because there may always be that fringe case...
- `aceInstance.destroy()`: destroys the AceDiff instance. Basically this just destroys both editors and cleans out the gutter.


## Browser Support
All modern browsers. Open a ticket if you find otherwise.


## License
MIT.
