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

  const props = {
    'memos': {
      'curX': 0,
      'curY': 0,
      'scrollBehavior': null,
      'isOnMobile': null,
      'richGalleryItems': null,
      'tab': false,
      'tabTimeout': null
    },
    'options': mauGallerydefaults,
    'tagsSet': new Set()
  }

  Object.seal(props);
  Object.seal(props.memos);

  function tagsSet() {
    return props.tagsSet;
  }

  function options(key) {
    const obj = props.options;
    if (!(key in obj)) {
      throw new Error(`No option value found with this key: ${key}`);
    }

    const value = obj[key];
    return value;
  }

  function memos(key, newValue = undefined) {
    const obj = props.memos;
    if (!(key in obj)) {
      throw new Error(`No memo value found with this key: ${key}`);
    }

    if (newValue !== undefined) {
      obj[key] = newValue;
      return;
    }
    const value = obj[key];
    return value;
  }

  function injectMau(props) {
    function isOnMobile() {
      if (memos('isOnMobile') === null) {
        memos('isOnMobile', (navigator.userAgent.match(/Android/i)
          || navigator.userAgent.match(/webOS/i)
          || navigator.userAgent.match(/iPhone/i)
          || navigator.userAgent.match(/iPad/i)
          || navigator.userAgent.match(/iPod/i)
          || navigator.userAgent.match(/BlackBerry/i)
          || navigator.userAgent.match(/Windows Phone/i)));
      }
      return memos('isOnMobile');
    }

    function saveCurrentCameraPosition() {
      memos('scrollBehavior', document.documentElement.style.scrollBehavior);
      document.documentElement.style.scrollBehavior = 'smooth !important;'
      memos('curX', window.scrollX);
      memos('curY', window.scrollY);
    }

    function clearSaveCurrentCameraPositionSideEffects() {
      document.documentElement.style.scrollBehavior = memos('scrollBehavior');
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
        snapCamera(memos('curX'), memos('curY'), delay + i);
      }
      clearSaveCurrentCameraPositionSideEffects();
    }

    function wrapItemInColumn(element) {
      function doWrap(element, wrapperOpen, wrapperClose) {
        orgHtml = element.outerHTML;
        newHtml = wrapperOpen + orgHtml + wrapperClose;
        element.outerHTML = newHtml;
      }

      const columns = options('columns');
      const mauPrefixClass = options('mauPrefixClass');
      const lightboxId = options('lightboxId');
      const modalTriggerClass = options('modalTriggerClass');
      const galleryRootNodeId = options('galleryRootNodeId');
      const isImg = element.tagName === 'IMG' || element.tagName === 'PICTURE';
      const injectModalTrigger = `data-bs-toggle="modal" data-bs-target=".${mauPrefixClass}#${lightboxId}" class="${mauPrefixClass} ${modalTriggerClass}"`;
      let wrapperOpen = '';
      let wrapperClose = '';
      if (isOnMobile()) {
        style.sheet.insertRule(`#${galleryRootNodeId} .${mauPrefixClass}.item-column a:focus {outline-style:none;box-shadow:none;border-color:transparent;}`, 0);
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
        const columnsObjSchema = {'xs': '', 'sm': '', 'md': '', 'lg': '', 'xl': ''}
        Object.keys(columns).forEach(key => {
          if (!(key in columnsObjSchema)) {
            throw new Error(`Unknown columns key: ${key}.`);
          }
        });
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
        throw new Error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    }

    function setGalleryImgDisplayStyle(img, displayStyle) {
      if (img.parentNode.tagName === 'PICTURE') {
        img.parentNode.style.display = displayStyle;
      } else {
        img.style.display = displayStyle;
      }
    }

    function setGalleryImgToOff(img) {
      setGalleryImgDisplayStyle(img, 'none');
    }

    function setGalleryImgToOn(img) {
      setGalleryImgDisplayStyle(img, 'block');
    }

    function initializeModalImg(element, htmlAttributesWhitelist) {
      function purgeModalImg(element, htmlAttributesWhitelist) {
        const toRemove = [];
        for (let i = 0, attrs = element.attributes; attrs[i]; i++) {
          let attrKey = attrs[i].nodeName;
          if (htmlAttributesWhitelist.indexOf(attrKey) === -1) {
            toRemove.push(attrKey);
          }
        }
        toRemove.forEach(attrKey => element.removeAttribute(attrKey));
      }
      purgeModalImg(element, htmlAttributesWhitelist);

      const alt = element.getAttribute('alt');
      const srcset = element.getAttribute('srcset') ?? null;
      const sizes = element.getAttribute('sizes') ?? null;
      element.className = `${options('mauPrefixClass')} img-fluid`;
      element.setAttribute('alt', alt);
      if (srcset) {
        element.setAttribute('srcset', srcset);
      }
      if (sizes) {
        element.setAttribute('sizes', sizes);
      }
    }

    function buildImagesCollection(modal) {
      const mauPrefixClass = options('mauPrefixClass');
      const filtersActiveTagId = options('filtersActiveTagId');
      const activeTag = document.querySelector(`.${mauPrefixClass}#${filtersActiveTagId}`).dataset.imagesToggle;
      const attributeFilter = activeTag === 'all' ? '' : `[data-gallery-tag="${activeTag}"]`;
      const galleryItems = modal.querySelectorAll(`img.${mauPrefixClass}${attributeFilter}`);

      return galleryItems;
    }

    function getCurrentModalImage(modal) {
      return modal.querySelector(`#${options('lightboxImgId')}`);
    }

    function updateModalImg(modal, newModalImg) {
      const oldModalImg = getCurrentModalImage(modal);
      setGalleryImgToOn(newModalImg);
      setGalleryImgToOff(oldModalImg);
      oldModalImg.removeAttribute('id');
      newModalImg.id = options('lightboxImgId');
    }

    function prevImage(modal) {
      const imagesCollection = buildImagesCollection(modal);
      const activeImage = getCurrentModalImage(modal);

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
      updateModalImg(modal, prev);
    }

    function nextImage(modal) {
      const imagesCollection = buildImagesCollection(modal);
      const activeImage = getCurrentModalImage(modal);

      let index = 0;
      for (const image of imagesCollection) {
        index += 1;
        if (activeImage.getAttribute('src') === image.getAttribute('src')) {
          break;
        }
      }
      const next = imagesCollection[index] ?? imagesCollection[0];
      updateModalImg(modal, next);
    }

    function getRichGalleryItems(lazy = true) {
      if (lazy && memos('richGalleryItems')) {
        return memos('richGalleryItems');
      }
      const mauPrefixClass = options('mauPrefixClass');
      const galleryItemClass = options('galleryItemClass');
      const columns = document.querySelectorAll(`div.${mauPrefixClass}.item-column`);
      const dataEntries = [];
      let picture = null;
      columns.forEach(column => {
        const item = column.querySelector(`.${mauPrefixClass}.${galleryItemClass}`);
        if (item.parentNode.tagName === 'PICTURE') {
          picture = item.parentNode;
        }
        const entry = { item, column, picture };
        dataEntries.push(entry);
      });
      memos('richGalleryItems', dataEntries);
      return dataEntries;
    }

    function filterByTag(element) {
      function forceReplayAnim() {
        const galleryItemsRowId = options('galleryItemsRowId');
        const mauPrefixClass = options('mauPrefixClass');
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

      if (element.id === options('filtersActiveTagId')) {
        return;
      }

      saveCurrentCameraPosition();
      forceReplayAnim();
      const richGalleryItems = getRichGalleryItems(lazy = false);
      const mauPrefixClass = options('mauPrefixClass');
      const filtersActiveTagId = options('filtersActiveTagId');
      const activeTag = document.querySelector(`.${mauPrefixClass}#${filtersActiveTagId}`);
      const tag = element.dataset.imagesToggle;

      activeTag.classList.remove('active');
      activeTag.removeAttribute('id');
      element.classList.add(mauPrefixClass, 'active');
      element.id = filtersActiveTagId;

      richGalleryItems.forEach(richItem => {
        if (tag === 'all' || richItem.item.dataset.galleryTag === tag) {
          richItem.column.style.display = 'block';
        } else {
          richItem.column.style.display = 'none';
        }
        snapCameraToSavedPosition();
      });
    }

    function showItemTags(gallery) {
      const tagsPosition = options('tagsPosition');
      const activeTagId = options('filtersActiveTagId');
      const disableFiltersButtonLabel = options('disableFiltersButtonLabel');
      const mauPrefixClass = options('mauPrefixClass');
      let tagItems = `<li class="nav-item"><button style="touch-action:manipulation;" class="${mauPrefixClass} nav-link active" data-images-toggle="all" id="${activeTagId}">${disableFiltersButtonLabel}</button></li>`;
      tagsSet().forEach(value => tagItems += `<li class="nav-item"><button style="touch-action:manipulation;" class="${mauPrefixClass} nav-link" data-images-toggle="${value}">${value}</button></li>`);
      const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      if (tagsPosition === 'bottom') {
        gallery.innerHTML = gallery.innerHTML + tagsRow;
      } else if (tagsPosition === 'top') {
        gallery.innerHTML = tagsRow + gallery.innerHTML;
      } else {
        throw new Error(`Unknown tags position: ${tagsPosition}`);
      }
    }

    function generateRowWrapper(target, item) {
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
      if (options('showTags') && tag) {
        tagsSet().add(tag);
      }
      const mauPrefixClass = options('mauPrefixClass');
      const galleryItemsRowId = options('galleryItemsRowId');
      const parent = target.querySelector(`.${mauPrefixClass}#${galleryItemsRowId}`);
      parent.append(item);
      wrapItemInColumn(item);
    }

    function generateListeners(gallery, modal) {
      function handleKeyDown(event) {
        if (event.keyCode == 37 || event.key === 'ArrowLeft') {
          prevImage(modal);
          const mauPrefixClass = options('mauPrefixClass');
          const mgPrevElement = modal.querySelector(`button.${mauPrefixClass}.mg-prev`);
          mgPrevElement.focus();
        }
        if (event.keyCode == 39 || event.key === 'ArrowRight') {
          nextImage(modal);
          const mauPrefixClass = options('mauPrefixClass');
          const mgNextElement = modal.querySelector(`button.${mauPrefixClass}.mg-next`);
          mgNextElement.focus();
        }
      }

      const mauPrefixClass = options('mauPrefixClass');
      const modalTriggerClass = options('modalTriggerClass');
      elements = gallery.querySelectorAll(`.${mauPrefixClass}.${modalTriggerClass}`);
      document.addEventListener('keydown', (event) => {
        if (event.keyCode == 9 || event.key === 'Tab') {
          memos('tab', true);
          if (memos('tabTimeout')) {
            clearTimeout(memos('tabTimeout'));
            memos('tabTimeout', null);
          }
          memos('tabTimeout', setTimeout(() => {
            memos('tab', false);
            memos('tabTimeout', null);
          }, 850));
        }
      })
      elements.forEach(element => {
        element.addEventListener('click', (event) => {
          if (!memos('tab')) {
            saveCurrentCameraPosition();
          } else {
            memos('curX', -1);
          }
          let imgElement = event.target.querySelector('img') ?? event.target;
          if (options('lightBox') && imgElement) {
            if (imgElement.parentNode.tagName === 'PICTURE') {
              imgElement = imgElement.parentNode;
            }
            lightBoxOnOpen(modal, imgElement);
          }
        });
      });

      const galleryRootNodeId = options('galleryRootNodeId');
      const galleryElementNavLinks = gallery.querySelectorAll(`.${mauPrefixClass}.nav-link`);
      const galleryElementMgPrev = gallery.querySelector(`#${galleryRootNodeId} .${mauPrefixClass}.mg-prev`);
      const galleryElementMgNext = gallery.querySelector(`#${galleryRootNodeId} .${mauPrefixClass}.mg-next`);

      galleryElementNavLinks.forEach(navlink => navlink.addEventListener('click', (event) => filterByTag(event.target)));
      galleryElementMgPrev.addEventListener('click', () => prevImage(modal));
      galleryElementMgNext.addEventListener('click', () => nextImage(modal));

      modal.addEventListener('shown.bs.modal', () => {
        document.addEventListener('keydown', handleKeyDown);
      });

      modal.addEventListener('hidden.bs.modal', () => {
        if (options('navigation')) {
          const buttons = modal.querySelectorAll('button');
          buttons.forEach(button => button.removeAttribute('tabindex'));
        }
        snapCameraToSavedPosition();
        document.removeEventListener('keydown', handleKeyDown);
        const oldCurrentModalImg = getCurrentModalImage(modal);
        setGalleryImgToOff(oldCurrentModalImg);
        oldCurrentModalImg.removeAttribute('id');
      });
    }

    function lightBoxOnOpen(modal, element) {
      let providedImg = element;
      if (element.tagName === 'PICTURE') {
        providedImg = element.querySelector('img');
      }
      const modalImgs = modal.querySelectorAll('img');
      for (const modalImg of modalImgs) {
        if (modalImg.getAttribute('src') === providedImg.getAttribute('src')) {
          modalImg.id = options('lightboxImgId');
          setGalleryImgToOn(modalImg);
          break;
        }
      }

      if (options('navigation')) {
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => button.setAttribute('tabindex', 0));
      }
    }

    function createLightBox(gallery) {
      const lightboxId = options('lightboxId');
      const navigation = options('navigation');
      const prevImgBtnLabel = options('prevImgButtonLabel');
      const nextImgBtnLabel = options('nextImgButtonLabel');
      const mauPrefixClass = options('mauPrefixClass');
      const htmlAttributesWhitelist = ['src', 'alt', 'srcset', 'sizes', 'data-gallery-tag'];

      let allOuterHTML = '';
      memos('richGalleryItems').forEach(galleryItem => {
        let currentElement = null;
        if (galleryItem.picture) {
          currentElement = galleryItem.picture.cloneNode(deep = true);
          initializeModalImg(currentElement.querySelector('img'), htmlAttributesWhitelist);
        } else if (galleryItem.item.tagName === 'IMG') {
          currentElement = galleryItem.item.cloneNode(deep = true);
          initializeModalImg(currentElement, htmlAttributesWhitelist);
        }
        if (currentElement) {
          initializeModalImg(currentElement, htmlAttributesWhitelist);
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

    function createRowWrapper(element) {
      if (!element.classList.contains('row')) {
        const div = document.createElement('div');
        div.id = options('galleryItemsRowId');
        div.classList.add(options('mauPrefixClass'), 'row');
        element.append(div);
      }
    }

    function appendCSS() {
      const optionsStyles = props.options.styles;
      function animationStyleProperty(animationCategory, key) {
        return optionsStyles.animation[animationCategory][key];
      }

      const arrowTransitionDelay = animationStyleProperty('modal', 'arrowTransitionDelay');
      const animationName = animationStyleProperty('gallery', 'animationName');
      const animationKeyframes = animationStyleProperty('gallery', 'animationKeyframes');
      const animationDurationOnFilter = animationStyleProperty('gallery', 'animationDurationOnFilter');
      const animationEasing = animationStyleProperty('gallery', 'animationEasing');
      const animationDurationOnModalAppear = animationStyleProperty('gallery', 'animationDurationOnModalAppear');

      const modalNavigation = optionsStyles.modal.navigation;
      const modalNavigationFontSize = modalNavigation['fontSize'];
      const modalArrowBoxesSize = modalNavigation['arrowBoxesSize'];

      const animationRuleValue = `${animationName} ${animationDurationOnFilter} ${animationEasing}`;
      const modalAnimationRuleValue = `${animationName} ${animationDurationOnModalAppear} ${animationEasing}`;

      const mauPrefixClass = options('mauPrefixClass');
      const galleryItemsRowId = options('galleryItemsRowId');
      const fontSize = modalNavigationFontSize ?? `calc(${modalArrowBoxesSize} / 2)`;

      const rules = {
        'animationKeyframes': `@keyframes ${animationName} ${animationKeyframes}`,
        'galleryAnimation': `
          .${mauPrefixClass}#${galleryItemsRowId} {
          animation: ${animationRuleValue}
        }`,
        'modalAnimation': `
          .${mauPrefixClass}.modal {
            animation: ${modalAnimationRuleValue}
          }`,
        'navigationButtons': `
          .${mauPrefixClass}.mg-next, .${mauPrefixClass}.mg-prev {
            display: block;
            position: absolute;
            bottom: calc(50% - calc(${modalArrowBoxesSize} / 2));
            width: ${modalArrowBoxesSize};
            height: ${modalArrowBoxesSize};
            border-radius: 0;
            font-size: ${fontSize};
            transition: left ${arrowTransitionDelay}, right ${arrowTransitionDelay};
          }`,
        'navigationButtonRight': `
          .${mauPrefixClass}.mg-next {
            --_delta: calc(${modalArrowBoxesSize} * .1);
            --_negative-value: -${modalArrowBoxesSize};
            --_right: calc(var(--_negative-value) + var(--_delta));
            right: var(--_right)
          }`,
        'navigationButtonLeft': `
          .${mauPrefixClass}.mg-prev {
            --_delta: calc(${modalArrowBoxesSize} * .1);
            --_negative-value: -${modalArrowBoxesSize};
            --_left: calc(var(--_negative-value) + var(--_delta));
            left: var(--_left);
          }`,
        'navigationButtonsResponsive': `
          @media (max-width: 1000px) {
            .mau.mg-next, .mau.mg-prev {
              left: calc(var(--_left) / 12);
              right: calc(var(--_right) / 12);
              margin: 0 calc(${modalArrowBoxesSize} * .1);
              transition: left ${arrowTransitionDelay}, right ${arrowTransitionDelay};
            }
          }`
      };
      Object.keys(rules).reverse().forEach(key => style.sheet.insertRule(rules[key].replace(/ +/g, ' '), 0));
    }

    function process() {
      const galleryRootNodeId = options('galleryRootNodeId');
      const mauPrefixClass = options('mauPrefixClass');
      const galleryItemClass = options('galleryItemClass');
      const lightBox = options('lightBox');
      const lightboxId = options('lightboxId');
      const target = document.querySelector(`#${galleryRootNodeId}`);
      appendCSS();
      createRowWrapper(target);

      target.querySelectorAll(`.${mauPrefixClass}.${galleryItemClass}`).forEach(item => {
        if (item.parentNode.tagName === 'PICTURE') {
          item = item.parentNode;
        }
        generateRowWrapper(target, item);
      });
      getRichGalleryItems();
      if (lightBox) {
        createLightBox(target);
      }

      if (options('showTags')) {
        showItemTags(target);
      }
      const modal = document.querySelector(`.${mauPrefixClass}#${lightboxId}`);
      generateListeners(target, modal);
    }

    process();
  }

  function run(opt) {
    Object.assign(props.options, opt);
    injectMau(props);
  }

  run(opt);
}
