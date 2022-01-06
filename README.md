# vtex io intellisense

The Vtex io intellisense help you develop with vtex store-framework with snippets and autocomplete.

## Features

### autocomplete

![Autocomplete demonstration](https://user-images.githubusercontent.com/48053804/141369446-3df45670-6d9b-4f4b-8e96-435518b884d9.gif)
`ATTENTION: The auto complete works only on 'json' and 'jsonc' files above a 'store' folder`

| blocks with auto complete                                  |
| :--------------------------------------------------------- |
| "back-to-top-button"                                       |
| "blog-latest-posts-preview.wordpress-latest-posts-preview" |
| "breadcrumb.search"                                        |
| "breadcrumb"                                               |
| "condition-layout.binding"                                 |
| "condition-layout.product"                                 |
| "disclosure-content"                                       |
| "disclosure-layout-group"                                  |
| "disclosure-layout"                                        |
| "disclosure-state-indicator"                               |
| "disclosure-trigger-group"                                 |
| "disclosure-trigger"                                       |
| "filter-navigator.v3"                                      |
| "flex-layout.col"                                          |
| "flex-layout.row"                                          |
| "gallery-layout-option"                                    |
| "gallery-layout-switcher"                                  |
| "gallery"                                                  |
| "icon"                                                     |
| "iframe"                                                   |
| "image"                                                    |
| "link"                                                     |
| "link.product"                                             |
| "list-context.image-list"                                  |
| "list-context.product-list"                                |
| "login-content"                                            |
| "login"                                                    |
| "logo"                                                     |
| "menu-item"                                                |
| "minicart.v2"                                              |
| "modal-actions.close"                                      |
| "modal-header"                                             |
| "modal-layout"                                             |
| "modal-trigger"                                            |
| "newsletter-form"                                          |
| "newsletter-input-email"                                   |
| "newsletter-input-name"                                    |
| "newsletter-input-phone"                                   |
| "newsletter-submit"                                        |
| "overlay-layout"                                           |
| "overlay-trigger"                                          |
| "paged-controls"                                           |
| "product-brand"                                            |
| "product-description"                                      |
| "product-images"                                           |
| "product-installments-list"                                |
| "product-name"                                             |
| "product-specification-badges"                             |
| "product-specification-group"                              |
| "product-specification-text"                               |
| "product-specification-value"                              |
| "product-specification"                                    |
| "product-summary-image"                                    |
| "rich-text"                                                |
| "sandbox"                                                  |
| "sandbox.order"                                            |
| "sandbox.product"                                          |
| "scroll-animate"                                           |
| "search-banner"                                            |
| "search-bar"                                               |
| "search-not-found-layout"                                  |
| "search-result-layout"                                     |
| "shelf.relatedProducts"                                    |
| "sku-selector"                                             |
| "slider-layout"                                            |
| "stack-layout"                                             |
| "sticky-layout.stack-container"                            |
| "sticky-layout"                                            |
| "store."                                                   |
| "store.search"                                             |
| "tab-content.item"                                         |
| "tab-content"                                              |
| "tab-layout"                                               |
| "tab-list.item.children"                                   |
| "tab-list.item"                                            |
| "tab-list"                                                 |
| "vtex.menu@2.x:menu"                                       |
| "video"                                                    |

### snippets

for `.json` and `.jsonc`.

| trigger | result                             |
| ------: | ---------------------------------- |
|   `flr` | create a flex layout row           |
|   `flc` | create a flex layout col           |
| `shelf` | create a shelf basic layout        |
|    `rt` | create a rich-text block           |
| `image` | create a image block               |
|   `stl` | create a stack layout              |
|    `dl` | create a disclosure layout         |
|   `rld` | create a responsive layout desktop |
|   `rlm` | create a responsive layout mobile  |
|   `rlt` | create a responsive layout tablet  |
|   `rlp` | create a responsive layout phone   |
|   `clp` | create a condition layout product  |
|   `clb` | create a condition layout binding  |
|  `link` | create a link                      |
|   `ovl` | create a overlay layout            |

for `.css` and `.scss`

| trigger | result                                         |
| ------- | ---------------------------------------------- |
| `flr`   | create a `.flexRow--`                          |
| `flrc`  | create a `.flexRowContent--`                   |
| `flc`   | create a `.flexCol--`                          |
| `flcc`  | create a `.flexColChild--`                     |
| `vbtn`  | create a `:global(.vtex-button)`               |
| `vbtnl` | create a `:global(.vtex-button__label)`        |
| `vip`   | create a `:global(.vtex-styleguide-9-x-input)` |
| `vipg`  | create a `:global(.vtex-input-prefix__group)`  |
| `vil`   | create a `:global(.vtex-input__label)`         |
| `:gl`   | create a `:global()`                           |

<!--

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them. -->

## Extension Settings

This extension contributes the following settings:

![beta](https://img.shields.io/badge/-beta-red)

- `vtexiointellisense.allowsUnusedBlocks`: if set to `false` all unused block will be show a warning of `unused block`. Default value is `true`

## Known Issues

Activate experimental unused blocks may cause a long wait for show the snippets

<!--
## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

-----------------------------------------------------------------------------------------------------------

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!** -->
