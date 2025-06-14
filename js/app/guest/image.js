import { progress } from "./progress.js";
// import { cache } from "../../connection/cache.js";

export const image = (() => {
  /**
   * @type {NodeListOf<HTMLImageElement>|null}
   */
  let images = null;

  let hasSrc = false;

  /**
   * @type {object[]}
   */
  // const urlCache = [];

  /**
   * @param {HTMLImageElement} el
   * @param {string} src
   * @returns {Promise<void>}
   */
  // const appendImage = (el, src) =>
  //   new Promise((res) => {
  //     const img = new Image();

  //     img.onload = () => {
  //       console.log("Loaded image:", src);
  //       el.src = img.src;
  //       el.width = img.naturalWidth;
  //       el.height = img.naturalHeight;
  //       progress.complete("image");
  //       img.remove();
  //       res();

  //       img.onerror = () => {
  //         console.error("Failed to load image:", src);
  //         progress.invalid("image");
  //         res(); // Ensure the promise resolves to prevent a hang
  //       };
  //     };

  //     img.src = src;
  //   });
  const appendImage = (el, src) =>
    new Promise((res, rej) => {
      const img = new Image();

      img.onload = () => {
        el.src = img.src;
        el.width = img.naturalWidth;
        el.height = img.naturalHeight;
        console.log("sebelum complete ->", el.src, src);
        progress.complete("image");
        res();
      };

      img.onerror = () => {
        console.error("Failed to load image:", src);
        progress.invalid("image");
        rej();
      };

      img.src = src;
    });

  /**
   * @param {HTMLImageElement} el
   * @returns {void}
   */
  // const getByFetch = (el) => {
  //   console.log("Default fetched:", el.src);
  //   urlCache.push({
  //     url: el.getAttribute("data-src"),
  //     res: (url) => appendImage(el, url),
  //     rej: () => progress.invalid("image"),
  //   });
  // };
  const getByFetch = (el) => {
    // console.log("by fetch");
    const src = el.getAttribute("data-src");
    if (!src) {
      progress.invalid("image");
      return Promise.resolve(); // Graceful fallback
    }

    // return appendImage(el, src)
    //   .then(() => {
    //     el.classList.remove("opacity-0");
    //   })
    //   .catch(() => progress.invalid("image"));
    try {
      return appendImage(el, src)
        .then(() => {
          el.classList.remove("opacity-0");
          el.removeAttribute("data-src");
        })
        .catch(() => progress.invalid("image"));
    } catch (err) {
      console.log(err);

      progress.invalid("image");
      return Promise.resolve();
    }
  };

  /**
   * @param {HTMLImageElement} el
   * @returns {void}
   */
  // const getByDefault = (el) => {
  //   // console.log("by default");
  //   el.onerror = () => progress.invalid("image");
  //   el.onload = () => {
  //     // console.log("Default loaded:", el.src);
  //     el.width = el.naturalWidth;
  //     el.height = el.naturalHeight;
  //     progress.complete("image");
  //   };

  //   if (el.complete && el.naturalWidth !== 0 && el.naturalHeight !== 0) {
  //     progress.complete("image");
  //   } else if (el.complete) {
  //     progress.invalid("image");
  //   }
  // };

  const getByDefault = (el) => {
    return new Promise((resolve, reject) => {
      if (el.complete) {
        if (el.naturalWidth !== 0 && el.naturalHeight !== 0) {
          el.width = el.naturalWidth;
          el.height = el.naturalHeight;
          progress.complete("image");
          resolve();
        } else {
          progress.invalid("image");
          reject();
        }
        return;
      }

      el.onload = () => {
        el.onload = null;
        el.onerror = null;
        el.width = el.naturalWidth;
        el.height = el.naturalHeight;
        progress.complete("image");
        resolve();
      };

      el.onerror = () => {
        el.onload = null;
        el.onerror = null;
        progress.invalid("image");
        reject();
      };
    });
  };

  /**
   * @returns {boolean}
   */
  const hasDataSrc = () => hasSrc;

  /**
   * @returns {Promise<void>}
   */
  // const load = async () => {
  //   const arrImages = Array.from(images);

  //   arrImages
  //     .filter((el) => el.getAttribute("data-fetch-img") !== "high")
  //     .forEach((el) => {
  //       el.hasAttribute("data-src") ? getByFetch(el) : getByDefault(el);
  //     });

  //   if (!hasSrc) {
  //     return;
  //   }

  // const c = cache("image");
  // const cancel = new Promise((res) =>
  //   document.addEventListener("progress.invalid", res, { once: true })
  // );

  // await c.open();
  // await Promise.allSettled(
  //   arrImages
  //     .filter((el) => el.getAttribute("data-fetch-img") === "high")
  //     .map((el) => {
  //       return c
  //         .get(el.getAttribute("data-src"), cancel)
  //         .then((i) => appendImage(el, i))
  //         .then(() => el.classList.remove("opacity-0"));
  //     })
  // );
  // await c.run(urlCache, cancel);

  // };
  // const load = async () => {
  //   const arrImages = Array.from(images);

  //   await Promise.allSettled(
  //     arrImages.map((el) => {
  //       // console.log("image load:", el);
  //       const src = el.getAttribute("data-src");

  //       if (src && el.getAttribute("data-fetch-img") === "high") {
  //         return appendImage(el, src)
  //           .then(() => el.classList.remove("opacity-0"))
  //           .catch(() => progress.invalid("image"));
  //       } else {
  //         // console.log("lewat", src);
  //         return new Promise((resolve) => {
  //           if (src) {
  //             getByFetch(el);
  //           } else {
  //             getByDefault(el);
  //           }
  //           resolve();
  //         });
  //       }
  //     })
  //   );
  const load = async () => {
    const arrImages = Array.from(images);

    await Promise.allSettled(
      arrImages.map((el) => {
        const src = el.getAttribute("data-src");
        const fetchPriority = el.getAttribute("data-fetch-img");

        if (src && fetchPriority === "high") {
          return appendImage(el, src)
            .then(() => el.classList.remove("opacity-0"))
            .catch(() => progress.invalid("image"));
        }

        if (src) {
          return getByFetch(el); // getByFetch returns a promise
        }

        getByDefault(el); // Not async
        return Promise.resolve(); // Graceful fallback
      })
    );
  };

  // const arrImages = Array.from(images);

  // await Promise.allSettled(
  //   arrImages.map((el) => {
  //     if (el.getAttribute("data-fetch-img") === "high") {
  //       const src = el.getAttribute("data-src");
  //       return fetch(src)
  //         .then((res) => {
  //           if (!res.ok) throw new Error("Image fetch failed");
  //           return res.blob();
  //         })
  //         .then((blob) => {
  //           const objectURL = URL.createObjectURL(blob);
  //           return appendImage(el, objectURL).then(() => {
  //             el.classList.remove("opacity-0");
  //             URL.revokeObjectURL(objectURL);
  //           });
  //         })
  //         .catch(() => progress.invalid("image"));
  //     } else {
  //       return new Promise((resolve) => {
  //         if (el.hasAttribute("data-src")) {
  //           getByFetch(el);
  //         } else {
  //           getByDefault(el);
  //         }
  //         resolve();
  //       });
  //     }
  //   })
  // );
  // };

  /**
   * @returns {object}
   */
  const init = () => {
    // images = document.querySelectorAll("img");
    images = document.querySelectorAll("img");
    console.log("this is imagess", images);
    // images.forEach(progress.add);
    // hasSrc = Array.from(images).some((i) => i.hasAttribute("data-src"));
    Array.from(images).forEach((img) => {
      // const needsLoading =
      //   img.hasAttribute("data-src") ||
      //   !img.complete ||
      //   img.naturalWidth === 0 ||
      //   img.naturalHeight === 0;

      // if (needsLoading) {
      // }
      progress.add();
    });

    hasSrc = Array.from(images).some((i) => i.hasAttribute("data-src"));

    return {
      load,
      hasDataSrc,
    };
  };

  return {
    init,
  };
})();
