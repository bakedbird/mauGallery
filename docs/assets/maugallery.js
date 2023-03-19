function mauGallery(opt = {}) {
  const mauGallerydefaults = {
    'columns': 3,
    'lightBox': true,
    'showTags': true,
    'navigation': true,
    'tagsPosition': 'bottom',
    'prevImgButtonLabel': 'Previous image',
    'nextImgButtonLabel': 'Next image',
    'disableFiltersButtonLabel': 'All',
    'mauPrefixClass': 'mau',
    'lightboxId': 'mauDefaultLightboxId',
    'galleryRootNodeId': 'maugallery',
    'galleryItemsRowId': 'gallery-items-row',
    'filtersActiveTagId': 'active-tag',
    'lightboxImgId': 'lightboxImage',
    'galleryItemClass': 'gallery-item',
    'modalTriggerClass': 'modal-trigger',
    'styles': {
      'animation': {
        'gallery': {
          'animationName': 'mauGalleryFadeInDefaultAnimationName',
          'animationKeyframes': '{0% {opacity: 0} 5% {opacity: 0} 100% {opacity: 1}}',
          'animationDurationOnFilter': '.5s',
          'animationDurationOnModalAppear': '.25s',
          'animationEasing': 'ease-in'
        },
        'modal': {
          'arrowTransitionDelay': '.4s'
        }
      },
      'modal': {
        'navigation': {
          'arrowBoxesSize': '50px',
          'fontSize': null
        }
      }
    }
  };

  const style = (() => {
    let style = document.createElement('style');
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
    return style;
  })();

  let memoCurX = 0;
  let memoCurY = 0;
  let memoScrollBehavior = null;
  let memoIsOnMobile = null;
  let memoRichGalleryItems = null;
  let memoTab = false;
  let memoTabTimeout = null;
  const tagsSet = new Set();

  function injectMau(target, options) {
    function isOnMobile() {
      if (memoIsOnMobile === null) {
        memoIsOnMobile = (navigator.userAgent.match(/Android/i)
          || navigator.userAgent.match(/webOS/i)
          || navigator.userAgent.match(/iPhone/i)
          || navigator.userAgent.match(/iPad/i)
          || navigator.userAgent.match(/iPod/i)
          || navigator.userAgent.match(/BlackBerry/i)
          || navigator.userAgent.match(/Windows Phone/i));
      }
      return memoIsOnMobile;
    }

    function saveCurrentCameraPosition() {
      memoScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'smooth !important;'
      memoCurX = window.scrollX;
      memoCurY = window.scrollY;
    }

    function clearSaveCurrentCameraPositionSideEffects() {
      document.documentElement.style.scrollBehavior = memoScrollBehavior;
    }

    function snapCamera(x, y, delay = 0) {
      if (x < 0) {
        return;
      }
      setTimeout(() => {
        const oldScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto !important;'
        window.scrollTo({
          top: y,
          left: x,
          behavior: 'auto'
        });
        document.documentElement.style.scrollBehavior = oldScrollBehavior;
      }, delay);
    }

    function snapCameraToSavedPosition(delay = 0) {
      for (let i = 0; i < 25; i++) {
        snapCamera(memoCurX, memoCurY, delay + i);
      }
      clearSaveCurrentCameraPositionSideEffects();
    }

    function wrapItemInColumn(element, options) {
      function doWrap(element, wrapperOpen, wrapperClose) {
        orgHtml = element.outerHTML;
        newHtml = wrapperOpen + orgHtml + wrapperClose;
        element.outerHTML = newHtml;
      }

      const columns = options.columns;
      const mauPrefixClass = options.mauPrefixClass;
      const isImg = element.tagName === 'IMG' || element.tagName === 'PICTURE';
      const injectModalTrigger = `data-bs-toggle="modal" data-bs-target=".${mauPrefixClass}#${options.lightboxId}" class="${mauPrefixClass} ${options.modalTriggerClass}"`;
      let wrapperOpen = '';
      let wrapperClose = '';
      if (isOnMobile()) {
        style.sheet.insertRule(`#${options.galleryRootNodeId} .${mauPrefixClass}.item-column a:focus {outline-style:none;box-shadow:none;border-color:transparent;}`, 0);
      }
      if (typeof columns === 'number') {
        if (isImg) {
          wrapperOpen = `<div class='${mauPrefixClass} item-column mb-4 col-${Math.ceil(12 / columns)}'><a href="#" ${injectModalTrigger} style="text-decoration:none;color:inherit;display:flex;width:100%;height:100%">`;
          wrapperClose = '</a></div>';
        } else {
          wrapperOpen = `<div tabindex="0" class='${mauPrefixClass} item-column mb-4 col-${Math.ceil(12 / columns)}'><div style="width:100%;height:100%;">`;
          wrapperClose = '</div></div>';
        }
        doWrap(element, wrapperOpen, wrapperClose);
      } else if (typeof columns === 'object') {
        let columnClasses = '';
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        if (isImg) {
          wrapperOpen = `<div class='${mauPrefixClass} item-column mb-4${columnClasses}'><a href="#" ${injectModalTrigger} style="text-decoration:none;color:inherit;display:flex;width:100%;height:100%">`;
          wrapperClose = '</a></div>';
        } else {
          wrapperOpen = `<div tabindex="0" class='${mauPrefixClass} item-column mb-4${columnClasses}'><div style="width:100%;height:100%;">`;
          wrapperClose = '</div></div>';
        }
        doWrap(element, wrapperOpen, wrapperClose);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    }

    function setImgToOff(img) {
      if (img.parentNode.tagName === 'PICTURE') {
        img.parentNode.style.display = 'none';
      } else {
        img.style.display = 'none';
      }
    }

    function setImgToOn(img) {
      if (img.parentNode.tagName === 'PICTURE') {
        img.parentNode.style.display = 'block';
      } else {
        img.style.display = 'block';
      }
    }

    function initializeModalImg(element, whitelist, options) {
      function purgeModalImg(element, whitelist) {
        const toRemove = [];
        for (let i = 0, attrs = element.attributes; attrs[i]; i++) {
          let attrKey = attrs[i].nodeName;
          if (whitelist.indexOf(attrKey) === -1) {
            toRemove.push(attrKey);
          }
        }
        toRemove.forEach(attrKey => element.removeAttribute(attrKey));
      }
      purgeModalImg(element, whitelist);

      const alt = element.getAttribute('alt');
      const srcset = element.getAttribute('srcset') ?? null;
      const sizes = element.getAttribute('sizes') ?? null;
      element.className = `${options.mauPrefixClass} img-fluid`;
      element.setAttribute('alt', alt);
      if (srcset) {
        element.setAttribute('srcset', srcset);
      }
      if (sizes) {
        element.setAttribute('sizes', sizes);
      }
    }

    function buildImagesCollection(modal, options) {
      const mauPrefixClass = options.mauPrefixClass;
      const filtersActiveTagId = options.filtersActiveTagId;
      const activeTag = document.querySelector(`.${mauPrefixClass}#${filtersActiveTagId}`).dataset.imagesToggle;
      const attributeFilter = activeTag === 'all' ? '' : `[data-gallery-tag="${activeTag}"]`;
      const galleryItems = modal.querySelectorAll(`img.${mauPrefixClass}${attributeFilter}`);

      return galleryItems;
    }

    function getCurrentModalImage(modal, options) {
      return modal.querySelector(`#${options.lightboxImgId}`);
    }

    function prevImage(modal, options) {
      const imagesCollection = buildImagesCollection(modal, options);
      const activeImage = getCurrentModalImage(modal, options);

      let index = 0;
      for (const image of imagesCollection) {
        if (activeImage.getAttribute('src') === image.getAttribute('src')) {
          index -= 1;
          break;
        }
        index += 1;
      }
      const prev =
        imagesCollection[index] ??
        imagesCollection[imagesCollection.length - 1];
      const oldModalImg = modal.querySelector(`#${options.lightboxImgId}`);
      setImgToOn(prev);
      setImgToOff(oldModalImg);
      oldModalImg.removeAttribute('id');
      prev.id = options.lightboxImgId;
    }

    function nextImage(modal, options) {
      const imagesCollection = buildImagesCollection(modal, options);
      const activeImage = getCurrentModalImage(modal, options);

      let index = 0;
      for (const image of imagesCollection) {
        index += 1;
        if (activeImage.getAttribute('src') === image.getAttribute('src')) {
          break;
        }
      }
      const next = imagesCollection[index] ?? imagesCollection[0];
      const oldModalImg = modal.querySelector(`#${options.lightboxImgId}`);
      setImgToOn(next);
      setImgToOff(oldModalImg);
      oldModalImg.removeAttribute('id');
      next.id = options.lightboxImgId;
    }

    function getRichGalleryItems(options, lazy = true) {
      if (lazy && memoRichGalleryItems) {
        return memoRichGalleryItems;
      }
      const columns = document.querySelectorAll(`div.${options.mauPrefixClass}.item-column`);
      const dataEntries = [];
      let picture = null;
      columns.forEach(column => {
        const item = column.querySelector(`.${options.mauPrefixClass}.${options.galleryItemClass}`);
        if (item.parentNode.tagName === 'PICTURE') {
          picture = item.parentNode;
        }
        const entry = { item, column, picture };
        dataEntries.push(entry);
      });
      memoRichGalleryItems = dataEntries;
      return dataEntries;
    }

    function filterByTag(element, options) {
      function forceReplayAnim(options) {
        const galleryItemsRowId = options.galleryItemsRowId;
        const mauPrefixClass = options.mauPrefixClass;
        const rootNode = document.querySelector(`.${mauPrefixClass}#${galleryItemsRowId}`);
        if (!isOnMobile()) {
          const oldAnimation = rootNode.style.animation;
          const oldDisplay = rootNode.style.display;
          rootNode.style.animation = 'none';
          rootNode.style.display = 'none';
          rootNode.offsetHeight;
          rootNode.style.display = oldDisplay;
          rootNode.style.animation = oldAnimation;
        }
        const oldAnimationName = rootNode.style.animationName;
        rootNode.style.animationName = 'none';
        window.requestAnimationFrame(() => rootNode.style.animationName = oldAnimationName);
      }

      if (element.id === options.filtersActiveTagId) {
        return;
      }

      saveCurrentCameraPosition();
      forceReplayAnim(options);
      const richGalleryItems = getRichGalleryItems(options, lazy = false);
      const activeTag = document.querySelector(`.${options.mauPrefixClass}#${options.filtersActiveTagId}`);
      const tag = element.dataset.imagesToggle;

      activeTag.classList.remove('active');
      activeTag.removeAttribute('id');
      element.classList.add(options.mauPrefixClass, 'active');
      element.id = options.filtersActiveTagId;

      richGalleryItems.forEach(richItem => {
        if (tag === 'all' || richItem.item.dataset.galleryTag === tag) {
          richItem.column.style.display = 'block';
        } else {
          richItem.column.style.display = 'none';
        }
        snapCameraToSavedPosition();
      });
    }

    function showItemTags(gallery, options, tagsSet) {
      const tagsPosition = options.tagsPosition;
      const activeTagId = options.filtersActiveTagId;
      const disableFiltersButtonLabel = options.disableFiltersButtonLabel;
      let tagItems = `<li class="nav-item"><button style="touch-action:manipulation;" class="${options.mauPrefixClass} nav-link active" data-images-toggle="all" id="${activeTagId}">${disableFiltersButtonLabel}</button></li>`;
      tagsSet.forEach(value => tagItems += `<li class="nav-item"><button style="touch-action:manipulation;" class="${options.mauPrefixClass} nav-link" data-images-toggle="${value}">${value}</button></li>`);
      const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      if (tagsPosition === 'bottom') {
        gallery.innerHTML = gallery.innerHTML + tagsRow;
      } else if (tagsPosition === 'top') {
        gallery.innerHTML = tagsRow + gallery.innerHTML;
      } else {
        console.error(`Unknown tags position: ${tagsPosition}`);
      }
    }

    function generateRowWrapper(target, item, options, tagsSet) {
      let tag = null;
      let itemImg = null;
      if (item.tagName === 'IMG') {
        tag = item.dataset.galleryTag;
        item.classList.add('img-fluid');
      } else if (item.tagName === 'PICTURE') {
        itemImg = item.querySelector('img');
        tag = itemImg.dataset.galleryTag;
        itemImg.classList.add('img-fluid');
      }
      if (options.showTags && tag) {
        tagsSet.add(tag);
      }
      const parent = target.querySelector(`.${options.mauPrefixClass}#${options.galleryItemsRowId}`);
      parent.append(item);
      wrapItemInColumn(item, options);
    }

    function generateListeners(gallery, modal, options) {
      function handleKeyDown(event) {
        if (event.keyCode == 37 || event.key === 'ArrowLeft') {
          prevImage(modal, options);
          const mgPrevElement = modal.querySelector(`button.${options.mauPrefixClass}.mg-prev`);
          mgPrevElement.focus();
        }
        if (event.keyCode == 39 || event.key === 'ArrowRight') {
          nextImage(modal, options);
          const mgNextElement = modal.querySelector(`button.${options.mauPrefixClass}.mg-next`);
          mgNextElement.focus();
        }
      }

      elements = gallery.querySelectorAll(`.${options.mauPrefixClass}.${options.modalTriggerClass}`);
      document.addEventListener('keydown', (event) => {
        if (event.keyCode == 9 || event.key === 'Tab') {
          memoTab = true;
          if (memoTabTimeout) {
            clearTimeout(memoTabTimeout);
          }
          memoTabTimeout = setTimeout(() => {
            memoTab = false
            memoTabTimeout = null;
          }, 850);
        }
      })
      elements.forEach(element => {
        element.addEventListener('click', (event) => {
          if (!memoTab) {
            saveCurrentCameraPosition();
          } else {
            memoCurX = -1;
          }
          let imgElement = event.target.querySelector('img') ?? event.target;
          if (options.lightBox && imgElement) {
            if (imgElement.parentNode.tagName === 'PICTURE') {
              imgElement = imgElement.parentNode;
            }
            lightBoxOnOpen(modal, imgElement, options);
          }
        });
      });

      const galleryElementNavLinks = gallery.querySelectorAll(`.${options.mauPrefixClass}.nav-link`);
      const galleryElementMgPrev = gallery.querySelector(`#${options.galleryRootNodeId} .${options.mauPrefixClass}.mg-prev`);
      const galleryElementMgNext = gallery.querySelector(`#${options.galleryRootNodeId} .${options.mauPrefixClass}.mg-next`);

      galleryElementNavLinks.forEach(navlink => navlink.addEventListener('click', (event) => filterByTag(event.target, options)));
      galleryElementMgPrev.addEventListener('click', () => prevImage(modal, options));
      galleryElementMgNext.addEventListener('click', () => nextImage(modal, options));

      modal.addEventListener('shown.bs.modal', () => {
        document.addEventListener('keydown', handleKeyDown);
      });

      modal.addEventListener('hidden.bs.modal', () => {
        if (options.navigation) {
          const buttons = modal.querySelectorAll('button');
          buttons.forEach(button => button.removeAttribute('tabindex'));
        }
        snapCameraToSavedPosition();
        document.removeEventListener('keydown', handleKeyDown);
        const oldCurrentModalImg = modal.querySelector(`#${options.lightboxImgId}`);
        setImgToOff(oldCurrentModalImg);
        oldCurrentModalImg.removeAttribute('id');
      });
    }

    function lightBoxOnOpen(modal, element, options) {
      let providedImg = element;
      if (element.tagName === 'PICTURE') {
        providedImg = element.querySelector('img');
      }
      const modalImgs = modal.querySelectorAll('img');
      for (const modalImg of modalImgs) {
        if (modalImg.getAttribute('src') === providedImg.getAttribute('src')) {
          modalImg.id = options.lightboxImgId;
          setImgToOn(modalImg);
          break;
        }
      }

      if (options.navigation) {
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => button.setAttribute('tabindex', 0));
      }
    }

    function createLightBox(gallery, options) {
      const lightboxId = options.lightboxId;
      const navigation = options.navigation;
      const prevImgBtnLabel = options.prevImgButtonLabel;
      const nextImgBtnLabel = options.nextImgButtonLabel;
      const mauPrefixClass = options.mauPrefixClass;
      const whitelist = ['src', 'alt', 'srcset', 'sizes', 'data-gallery-tag'];

      let allOuterHTML = '';
      memoRichGalleryItems.forEach(galleryItem => {
        let currentElement = null;
        if (galleryItem.picture) {
          currentElement = galleryItem.picture.cloneNode(deep = true);
          initializeModalImg(currentElement.querySelector('img'), whitelist, options);
        } else if (galleryItem.item.tagName === 'IMG') {
          currentElement = galleryItem.item.cloneNode(deep = true);
          initializeModalImg(currentElement, whitelist, options);
        }
        if (currentElement) {
          currentElement.style.display = 'none';
          allOuterHTML += currentElement.outerHTML;
        }
      });
      const lightbox = `
        <div class="${mauPrefixClass} modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true" style="user-select:none;-webkit-user-select:none;">
          <div class="${mauPrefixClass} modal-dialog modal-dialog-centered" role="document">
            <div class="${mauPrefixClass} modal-content">
              <div class="${mauPrefixClass} modal-body" style="display:flex;align-items:center;justify-content:center;padding:0;margin:16px;">
                ${allOuterHTML}
              </div>
              ${navigation ? `<button aria-label="${prevImgBtnLabel}" class="${mauPrefixClass} mg-prev" style="touch-action:manipulation;border:none;background:#fff;"><span><</span></button>` : '<span style="display:none;" />'}
              ${navigation ? `<button aria-label="${nextImgBtnLabel}" class="${mauPrefixClass} mg-next" style="touch-action:manipulation;border:none;background:#fff;"><span>></span></button>` : '<span style="display:none;" />'}
            </div>
          </div>
        </div>`;
      gallery.innerHTML = gallery.innerHTML + lightbox;
    }

    function createRowWrapper(element, options) {
      if (!element.classList.contains('row')) {
        const div = document.createElement('div');
        div.id = options.galleryItemsRowId;
        div.classList.add(options.mauPrefixClass, 'row');
        element.append(div);
      }
    }

    function appendCSS(options) {
      const animationKeyframesRepresentation = `@keyframes ${options.styles.animation.gallery.animationName} ${options.styles.animation.gallery.animationKeyframes}`;
      const animationRuleValue = `${options.styles.animation.gallery.animationName} ${options.styles.animation.gallery.animationDurationOnFilter} ${options.styles.animation.gallery.animationEasing}`;
      const modalAnimationRuleValue = `${options.styles.animation.gallery.animationName} ${options.styles.animation.gallery.animationDurationOnModalAppear} ${options.styles.animation.gallery.animationEasing}`;
      const dispatchAnimOnGallery = `.${options.mauPrefixClass}#${options.galleryItemsRowId} {animation: ${animationRuleValue}}`;
      const dispatchAnimOnModal = `.${options.mauPrefixClass}.modal {animation: ${modalAnimationRuleValue}}`;

      const fontSize = options.styles.modal.navigation.fontSize ?? `calc(${options.styles.modal.navigation.arrowBoxesSize} / 2)`;
      const navigationButtonsRule = `
        .${options.mauPrefixClass}.mg-next, .${options.mauPrefixClass}.mg-prev {
        display:block;position:absolute;
        bottom:calc(50% - calc(${options.styles.modal.navigation.arrowBoxesSize} / 2));
        width:${options.styles.modal.navigation.arrowBoxesSize};
        height:${options.styles.modal.navigation.arrowBoxesSize};
        border-radius:0;font-size:${fontSize};
        transition: left ${options.styles.animation.modal.arrowTransitionDelay}, right ${options.styles.animation.modal.arrowTransitionDelay};}`;
      const navigationLeftRules = `
        .${options.mauPrefixClass}.mg-prev {
        --_delta: calc(${options.styles.modal.navigation.arrowBoxesSize} * .1);
        --_negative-value: -${options.styles.modal.navigation.arrowBoxesSize};
        --_left: calc(var(--_negative-value) + var(--_delta));
        left: var(--_left);}`;
      const navigationRightRules = `
        .${options.mauPrefixClass}.mg-next {
        --_delta: calc(${options.styles.modal.navigation.arrowBoxesSize} * .1);
        --_negative-value: -${options.styles.modal.navigation.arrowBoxesSize};
        --_right: calc(var(--_negative-value) + var(--_delta));
        right: var(--_right)}`;

      const navigationButtonsResponsiveRule = `@media (max-width: 1000px) {.mau.mg-next, .mau.mg-prev {
        left: calc(var(--_left) / 12); right: calc(var(--_right) / 12); margin:0 calc(${options.styles.modal.navigation.arrowBoxesSize} * .1);}
        transition: left ${options.styles.animation.modal.arrowTransitionDelay}, right ${options.styles.animation.modal.arrowTransitionDelay};}`;

      style.sheet.insertRule(animationKeyframesRepresentation, 0);
      style.sheet.insertRule(dispatchAnimOnGallery, 0);
      style.sheet.insertRule(dispatchAnimOnModal, 0);
      style.sheet.insertRule(navigationButtonsResponsiveRule, 0);
      style.sheet.insertRule(navigationButtonsRule, 0);
      style.sheet.insertRule(navigationRightRules, 0);
      style.sheet.insertRule(navigationLeftRules, 0);
    }

    function process(target, options) {
      appendCSS(options);
      createRowWrapper(target, options);

      target.querySelectorAll(`.${options.mauPrefixClass}.${options.galleryItemClass}`).forEach(item => {
        if (item.parentNode.tagName === 'PICTURE') {
          item = item.parentNode;
        }
        generateRowWrapper(target, item, options, tagsSet)
      });
      getRichGalleryItems(options);
      if (options.lightBox) {
        createLightBox(target, options);
      }

      if (options.showTags) {
        showItemTags(target, options, tagsSet);
      }
      const modal = document.querySelector(`.${options.mauPrefixClass}#${options.lightboxId}`);
      generateListeners(target, modal, options);
    }

    process(target, options);
  }

  function run(opt) {
    const options = mauGallerydefaults;
    Object.assign(options, opt);

    const target = document.querySelector(`#${options.galleryRootNodeId}`);
    injectMau(target, options);
  }

  run(opt);
}
