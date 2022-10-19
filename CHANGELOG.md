## [1.0.1](https://github.com/agencia-e-plus/vtex-io-intelisense/compare/v1.0.0...v1.0.1) (2022-10-19)


### Bug Fixes

* missing dependence ([770c5db](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/770c5db8b1bdc9c7cd36a39eb099fe364f18ff0d))

# 1.0.0 (2022-10-05)


### Bug Fixes

* add markdownDescription in props ([a43c23c](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/a43c23c35a3db8e4afed310fa99ca877f386a3c9))
* blockClass ref and switch enum to oneOf ([2762789](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/27627899948bbb1f5f7d3e6c9bb4bcaf04779785))
* blocks sugestion in multiline ([de68501](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/de68501c93e3226bc68eb808956462b897d13b27))
* file path to verify ([3395192](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/3395192261a2d2a19ae7cc9b62d3e8d6c8c3291f))
* no content files ([819af3e](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/819af3e6fb5f040ab64f20a3992f4f625ed4a33b))
* readme rephrasing for better understanding ([0fdb866](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/0fdb866edd3d68e39ede205c5bc61e8c864eaf87))
* unify commands ([273c10b](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/273c10b7fe1089e7ed0527213f9a1ac19ff2a307))


* BREAKING CHANGE: go to definition ([ad7e079](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/ad7e079a483e165485a8cf4f9e912197dbcf20a7))


### Features

* add add-to-cart-button block ([346b2e4](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/346b2e4ad2c7c2a5ce404b19cf60e4c5c84de2e9))
* add breadcrumb ([bb6f749](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/bb6f7495c48d434a976c2da5daac1203fe553256))
* add find unused blocks command ([48abffe](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/48abffe54646ef697b841b1553ece307de1fd593))
* add schema properties (alongside patternProperties) ([0e2b245](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/0e2b245370188e3fb217b4558701b927cb5b75ab))
* add tag prop to product name ([e78d6a3](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/e78d6a3b4c234e9e65072457c126d30565efad48))
* ctrl click ([d92bd9e](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/d92bd9e8900d400fede5e0ce39413567f84a1c2e))
* new blocks (collab with lv-ss@hotmail.com) ([b87845c](https://github.com/agencia-e-plus/vtex-io-intelisense/commit/b87845ccb6cb01ae142dc7c40877062c7a1e11cc))


### BREAKING CHANGES

* go to definition

# Change Log

All notable changes to the "vtexio-intellisense" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.4.4] - 2022-02-18

### Added

- `assembly-option-item-image` block
- `assembly-option-item-quantity-selector` block
- `assembly-option-item-name` block
- `assembly-option-item-price` block
- `assembly-option-item-customize` block
- `assembly-option-item-children-description` block
- `autocomplete-result-list.v2` block

### Fixed

- `search-bar` prop

## [0.4.0] - 2022-02-18

### Added

- experimental blocks suggestions

## [0.3.0] - 2022-02-18

### Added

- experimental duplicated blocks
- experimental command `store lint`

## [0.2.21] - 2022-02-18

### Added

- `product-summary-name` blocks
- `product-summary-shelf` blocks
- `product-quantity` blocks
- `product-summary-quantity` blocks
- `showClearAllFiltersOnDesktop` prop to `filter-navigator.v3`
- `showClearAllFiltersOnDesktop` prop to `filter-navigator.v3`
- `preferredSKU` prop to `gallery` block
- `specificationOptions` prop to `order-by.v2`
- `preventRouteChange` prop to `search-result-layout`

## [0.2.20] - 2022-02-10

### Fixed

- sku selector visiblevariations prop;

## [0.2.19] - 2022-01-31

### Fixed

- sandbox props;

## [0.2.18] - 2022-01-24

### Added

- `htmlId` prop to `rich-text`

## [0.2.17] - 2022-01-20

- fix `order-by.v2` schema ref.

## [0.2.16] - 2022-01-20

### Added

- add `children` prop to `minicart.v2`
- `hideOutOfStockItems` prop for `shelf`
- `order-by.v2` props

### Fixed

- `search-result-layout` schema ref
- `minicart` children prop

## [0.2.15] - 2022-01-06

### Fixed

- remove "undefined" autocomplete

### Added

- routes schema

## [0.2.13] - 2022-01-06

- sandbox schema
- sandbox.product schema
- sandbox.order schema
- `link.product` autocomplete
- `clb` snippet for `condition-layout.binding`
- `condition-layout.product` subject autocomplete
- `video` schema

## [0.2.12] - 2022-01-03

### Added

- missing props of logo

## [0.2.10] - 2022-01-03

### Added

- update `image` and `product-images` props

## [0.2.9] - 2022-01-03

### Fixed

- fix tab-list reference

## [0.2.8] - 2022-01-03

### Fixed

- menu.v2 schema reference

## [0.2.7] - 2022-01-03

### Fixed

- readme.md

## [0.2.6] - 2022-01-03

### Added

- minicart.v2 block
- sticky-layout block
- back-to-top-button block
- tab-layout block
- logo block
- product-brand block
- product-name block
- search-bar block
- login block
- vtex.menu@2.x:menu block
- menu-item block
- condition-layout.binding block

### Fixed

- condition-layout.product block

## [0.2.5] - 2021-12-22

### Fixed

- grid's blocks prop

## [0.2.4] - 2021-12-20

### Fixed

- fix input snippets

### Added

- description for title
- product installments schema

## [0.2.3] - 2021-12-16

### Fixed

- missed prop `title` for blocks

## [0.2.2] - 2021-12-16

### Fixed

- fix image block key match

## [0.2.1] - 2021-12-16

### Added

- add description for prop values
- schema `properties` (alongside `patternProperties`)

## [0.1.5] - 2021-12-15

### Added

- add autocomplete `apps.json` from edition apps
- add new prop to `slider-layout`

### Fixed

- fix block's conflict props recommendations

## [0.1.4] - 2021-12-13

### Added

- `vipg` snippet for `vtex input prefix group` in css and scss
- `vi` snippet for `vtex input` in css and scss
- `vil` snippet for `vtex input label` in css and scss
- `actioncard` snippet for Action card structure in json and jsonc

### Fixed

- component prop in `interfaces.json` schemas

## [0.1.2] - 2021-12-07

### Fixed

- validation path
- no explict use blocks
- shelf snippt
- interfaces autocomplete

## [0.1.1] - 2021-12-06

### Added

- configuration `vtexiointellisense.allowsUnusedBlocks` to disable\enable warnings

## [0.1.0] - 2021-12-04

### Added

- Unused Block warning

## [0.0.3] - 2021-12-04

### Added

- `interfaces.json` auto complete
- `vbtn` and `vbtnl` snippet

### fixed

- snippets scope

## [0.0.2]

### Fixed

- display Name;

## [0.0.1]

- Initial release;
