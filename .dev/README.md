
# Parsly API

This repository publishes the Parsly API via Github Pages. The published
material is based on redoc, and the build process is implemented with make.
To keep development and build assets separate from the published material,
we place those assets in the hidden .dev directory (hidden files are not
public via Github Pages).

## Requirements

This project uses redocly via `npx`, so you will need `npx` installed. Moreover, this project also fetches OpenAPI documents from the postal and parsly repositories, which are assumed to be cloned next to this repository:

```
.
├── datasyncer
├── parsly-api
└── postal
```

When this is the case, rules in the makefile will be able to find and use the OpenAPI documents accordingly.

## Updating API Documentation

To update the API documentation, move to the `.dev.` directory and run the make command:

```sh
cd .dev
make
```

To publish the documentation, simply commit and push the changes. This can be done via:

```sh
make publish
```

Notably, various OpenAPI documents are joined and bundled together to produce a final result, and this requires a certain amount of effort to ensure the source documents play well together.
