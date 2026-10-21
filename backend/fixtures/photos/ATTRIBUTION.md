# Demo photograph attribution

These are real photographs, not generated images. Re-encoded as metadata-free WebP without changing their subjects.

| File | Photographer / dedication | Authoritative source |
| --- | --- | --- |
| cup.webp | Rachel Michetti, courtesy of Pikolo Espresso Bar; CC0 | https://github.com/scikit-image/scikit-image/blob/v0.24.0/skimage/data/_fetchers.py#L912-L928 |
| clock.webp | Stefan van der Walt; public-domain dedication | https://github.com/scikit-image/scikit-image/blob/v0.24.0/skimage/data/_fetchers.py#L853-L867 |

Original files: https://github.com/scikit-image/scikit-image/blob/v0.24.0/skimage/data/coffee.png and https://github.com/scikit-image/scikit-image/blob/v0.24.0/skimage/data/clock_motion.png . CC0 terms: https://creativecommons.org/publicdomain/zero/1.0/ .

The cup image is used only for a new fictional cup-and-saucer listing; the clock image only for a new fictional wall-clock listing. They are not falsely attached to books, clothing or toys. Existing genuine images are never replaced.

Original source SHA-256 checksums were verified against scikit-image v0.24.0 `skimage/data/_registry.py`: coffee.png `cc02f8ca188b167c775a7101b5d767d1e71792cf762c33d6fa15a4599b5a8de7`; clock_motion.png `f029226b28b642e80113d86622e9b215ee067a0966feaf5e60604a1e05733955`. The committed WebP assets are optimized derivatives, so their byte hashes differ.

## Six original fictional listings

Downloaded and visually reviewed on 21 October 2026. All six use the [Pexels licence](https://www.pexels.com/license/), permitting free use and modification. Attribution is provided voluntarily. No endorsement is implied. These illustrate fictional listings; they do not document actual donated inventory or establish condition, size or exact quantities.

| Listing | Photographer and source | Matching review |
| --- | --- | --- |
| Science textbook collection | [RDNE Stock project](https://www.pexels.com/photo/open-book-with-a-photo-of-earth-8363782/) | An open educational book with a labelled Earth illustration. Represents the science content of the fictional collection, not a photograph of all six books or proof of grade/condition. |
| Warm winter layers | [Ralitsa Racheva](https://www.pexels.com/photo/clothes-on-couch-7691347/) | Three folded knitted sweaters in neutral colours on a sofa. The type and visible count match; size, washing and condition remain fictional listing details. |
| Wooden building blocks | [Julia Bataeva](https://www.pexels.com/photo/scattered-wooden-building-blocks-on-floor-31061855/) | Natural wooden geometric building blocks on a wooden floor. Represents the block set; the storage box and exact 48-piece inventory are not pictured. |
| Adjustable study lamp | [Prem Singh Tanwar](https://www.pexels.com/photo/black-desk-lamp-on-white-wall-8263858/) | A single black desk lamp with a visibly jointed adjustable arm. Bulb technology and working condition cannot be established from a photograph. |
| Children’s storybook bundle | [Kate L](https://www.pexels.com/photo/stack-of-children-s-books-on-a-wooden-bookshelf-31024471/) | A shelf of illustrated early-reader storybooks, including Curious George, Bambi and Spot. A representative selection; not evidence of the exact eight-book bundle. |
| Everyday kitchen starter set | [RDNE Stock project](https://www.pexels.com/photo/stack-of-plates-and-ceramic-bowls-8904068/) | Stacked ceramic plates and two bowls. Represents the tableware portion of the set; the saucepan is not pictured and no exact plate inventory is claimed. |

[Machine-readable provenance](manifest.json) records source URLs, licence, retrieval date, original and derivative SHA-256 hashes, dimensions and transformations. Images were resized and metadata stripped; kitchen tableware was cropped to remove empty background. No subjects were generated or added. Run `backend/scripts/attach-demo-photos.js` after the original seed: it fills only empty image fields for the six identified fictional items, validates asset hashes, and preserves every existing image. It does not create donations or alter requests.
