The schemata against which a cdnjs `package.json` will be validated.

Currently we use a modified version of the `npm-package.json` spec,
which is the addition of a required `filename` property use for
auto-generation of library links on http://cdnjs.com/

All `package.json` files in `ajax/libs` will be run against the specs
in this directory (currently only `npm-package.json`) to ensure they
are valid.