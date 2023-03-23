function mauGallery(opt = {}) {
  const mauGallerydefaults = {
    'columns': 3,
    'lightBox': true,
    'showTags': true,
    'navigation': true,
    'tagsPosition': 'top',
    'prevImgButtonLabel': 'Previous image',
    'nextImgButtonLabel': 'Next image',
    'disableFiltersButtonLabel': 'All',
    'mauPrefixClass': 'mau',
    'lightboxId': 'mauDefaultLightboxId',
    'galleryRootNodeId': 'maugallery',
    'galleryItemsRowId': 'gallery-items-row',
    'filtersActiveTagId': 'active-tag',
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
          'arrowBoxesSizeObj': { size: '50', unit: 'px' }
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
      'shownModal': false,
      'touchstartX': null,
      'touchendX': null,
      'touchstartY': null,
      'touchendY': null,
      'curX': 0,
      'curY': 0,
      'screenOrientation': null,
      'curYDelta': 0,
      'lockScreenHasGlitched': false,
      'activeElement': null,
      'activeElementAbsoluteY': null,
      'activeElementComputedBottom': null,
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

  function options(key = undefined) {
    if (key === undefined) {
      return props.options;
    }

    if (!(key in props.options)) {
      throw new Error(`No option value found with this key: ${key}`);
    }

    const value = props.options[key];
    return value;
  }

  function memos(key = undefined, newValue = undefined) {
    if (key === undefined) {
      return props.memos;
    }

    if (!(key in props.memos)) {
      throw new Error(`No memo value found with this key: ${key}`);
    }

    if (newValue !== undefined) {
      props.memos[key] = newValue;
      return;
    }

    const value = props.memos[key];
    return value;
  }

  function getModalCarouselElement() {
    const modalCarousel = document.querySelector(`#${options('lightboxId')}-carousel`);
    return modalCarousel;
  }

  function getModalElement() {
    const mauPrefixClass = options('mauPrefixClass');
    const lightboxId = options('lightboxId');
    const modal = document.querySelector(`.${mauPrefixClass}#${lightboxId}`);
    return modal;
  }

  function injectMau(props) {
    function isOnMobile() {
      if (memos('isOnMobile') === null) {
        const userAgent = navigator.userAgent.toLowerCase();
        memos('isOnMobile', userAgent.match(/(ipad)|(iphone)|(ipod)|(android)|(webos)|(blackberry)|(tablet)|(kindle)|(playbook)|(silk)|(windows phone)/i));
      }
      return memos('isOnMobile');
    }

    function getAbsoluteElementY(element) {
      const bodyRect = document.body.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const offset = elementRect.top - bodyRect.top;
      return offset;
    }

    function getElementUpperPx(element) {
      const navbarElement = document.querySelector('.navbar');
      const delta = navbarElement ? parseInt(window.getComputedStyle(navbarElement).height, 10) : 0;
      const height = parseInt(window.getComputedStyle(element).height, 10) - 1;
      const rect = element.getBoundingClientRect();
      const computedUpPx = rect.bottom - height + delta;
      return computedUpPx;
    }

    function isInViewport(element, checkFullyInViewport = false) {
      const width = parseInt(window.getComputedStyle(element).width, 10) - 1;
      const rect = element.getBoundingClientRect();
      const computedUpPx = getElementUpperPx(element);
      const computedLeftPx = rect.right - width;
      let expected = null;

      if (checkFullyInViewport) {
        expected = (computedUpPx >= 0 && computedLeftPx >= 0) &&
          (computedUpPx <= window.innerHeight && computedLeftPx <= window.innerWidth) &&
          (rect.bottom <= window.innerHeight && rect.right <= window.innerWidth)
      } else {
        expected = (computedUpPx >= 0 && computedLeftPx >= 0) &&
          (computedUpPx <= window.innerHeight && computedLeftPx <= window.innerWidth) ||
          (rect.bottom <= window.innerHeight && rect.right <= window.innerWidth)
      }
      return expected;
    }

    function clearSaveCurrentCameraPositionSideEffects() {
      document.documentElement.style.scrollBehavior = memos('scrollBehavior');
    }

    function snapCamera(x, y, delay = 0) {
      function doSnapCamera(x, y, delay) {
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

      if (x < 0) {
        return;
      }

      for (let i = 0; i < 25; i++) {
        doSnapCamera(x, y, delay + i);
      }
    }

    function saveActiveElement() {
      const activeElement = document.activeElement;

      if (activeElement) {
        memos('activeElement', activeElement);
        memos('activeElementAbsoluteY', getAbsoluteElementY(activeElement));
        memos('activeElementComputedBottom', parseInt(window.getComputedStyle(activeElement).bottom, 10));
      }
    }

    function saveCurrentCameraPosition() {
      memos('scrollBehavior', document.documentElement.style.scrollBehavior);
      memos('curX', window.scrollX);
      memos('curY', window.scrollY);
      saveActiveElement();
      document.documentElement.style.scrollBehavior = 'smooth !important;'
    }

    function moveCameraToSavedPosition(activeElement = null) {
      if (isOnMobile() || !activeElement) {
        const screenOrientation = getScreenOrientation();

        if (screenOrientation && screenOrientation != memos('screenOrientation')) {
          // ToDo: fix intelligent scroll here
          // const absoluteY = getAbsoluteElementY(activeElement);
          // alert(`test: ${absoluteY} || ${activeElement}`);
          // snapCamera(null, absoluteY);
        }
        snapCamera(memos('curX'), memos('curY'));
      } else if (activeElement) {
        let preventScroll = true;

        if (!isInViewport(activeElement, checkFullyInViewport = true)) {
          const computedUpPx = getElementUpperPx(activeElement);
          if (computedUpPx < 0) {
            activeElement.scrollIntoView(false);
          } else {
            if (!isInViewport(activeElement)) {
              preventScroll = false;
            }
          }
        }
        activeElement.focus({ preventScroll });

        if (preventScroll) {
          if (memos('lockScreenHasGlitched') && window.scrollY + memos('curYDelta') === memos('curY')) {
            snapCamera(memos('curX'), memos('curY'));
          }
        }
      }
      clearSaveCurrentCameraPositionSideEffects();
    }

    function getScreenOrientation() {
      if (!isOnMobile()) {
        return null;
      }

      if (window.innerWidth < window.innerHeight) {
        return 'p';
      }
      return 'l';
    }

    function wrap(element, wrapperOpen, wrapperClose) {
      orgHtml = element.outerHTML;
      newHtml = wrapperOpen + orgHtml + wrapperClose;

      if (!element.parentNode) {
        const parser = new DOMParser();
        const wrapperNode = parser.parseFromString(newHtml, "text/html");
        return wrapperNode.body.firstChild;
      } else {
        element.outerHTML = newHtml;
      }
    }

    function wrapItemInColumn(element) {
      const lightBox = options('lightBox');
      const columns = options('columns');
      const mauPrefixClass = options('mauPrefixClass');
      const modalTriggerClass = options('modalTriggerClass');
      const isImg = element.tagName === 'IMG' || element.tagName === 'PICTURE';
      const injectModalTrigger = lightBox ? `data-bs-toggle="modal" class="${mauPrefixClass} ${modalTriggerClass}"` : '';
      let wrapperOpen = '';
      let wrapperClose = '';

      if (typeof columns === 'number') {
        if (isImg && lightBox) {
          wrapperOpen = `<div class='${mauPrefixClass} item-column mb-4 col-${Math.ceil(12 / columns)}'><a href="#" ${injectModalTrigger} style="text-decoration:none;color:inherit;display:flex;width:100%;height:100%">`;
          wrapperClose = '</a></div>';
        } else {
          wrapperOpen = `<div class='${mauPrefixClass} item-column mb-4 col-${Math.ceil(12 / columns)}'><div tabindex="0" style="width:100%;height:100%;">`;
          wrapperClose = '</div></div>';
        }
        wrap(element, wrapperOpen, wrapperClose);
      } else if (typeof columns === 'object') {
        const columnsObjSchema = { 'xs': '', 'sm': '', 'md': '', 'lg': '', 'xl': '' }
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

        if (isImg && lightBox) {
          wrapperOpen = `<div class='${mauPrefixClass} item-column mb-4${columnClasses}'><a href="#" ${injectModalTrigger} style="text-decoration:none;color:inherit;display:flex;width:100%;height:100%">`;
          wrapperClose = '</a></div>';
        } else {
          wrapperOpen = `<div class='${mauPrefixClass} item-column mb-4${columnClasses}'><div tabindex="0" style="width:100%;height:100%;">`;
          wrapperClose = '</div></div>';
        }
        wrap(element, wrapperOpen, wrapperClose);
      } else {
        throw new Error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
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
      element.setAttribute('loading', 'lazy');

      if (srcset) {
        element.setAttribute('srcset', srcset);
      }

      if (sizes) {
        element.setAttribute('sizes', sizes);
      }

      element.style.maxWidth = '85vw';
      element.style.maxHeight = '85vh';
    }

    function getCurrentModalImage(modal) {
      const galleryItemClass = options('galleryItemClass');
      const mauPrefixClass = options('mauPrefixClass');
      return modal.querySelector(`.${mauPrefixClass}.modal-${galleryItemClass}.active img`);
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
      let activeElementOldTop = null;

      if (options("tagsPosition") === 'bottom') {
        activeElementOldTop = document.activeElement.getBoundingClientRect().top;
      }

      richGalleryItems.forEach(richItem => {
        if (tag === 'all' || richItem.item.dataset.galleryTag === tag) {
          richItem.column.style.display = null;
        } else {
          richItem.column.style.display = 'none';
        }

        if (options("tagsPosition") === 'top') {
          moveCameraToSavedPosition();
        }
      });

      const modalCarousel = getModalCarouselElement();
      const galleryItemClass = options('galleryItemClass');
      const modalCarouselColumns = modalCarousel.querySelectorAll(`.${mauPrefixClass}.modal-${galleryItemClass}`);
      modalCarouselColumns.forEach(column => {
        const item = column.querySelector('img');

        if (tag === 'all' || item.dataset.galleryTag === tag) {
          item.removeAttribute('loading');
          column.classList.add('carousel-item');
          column.style.display = null;
        } else {
          item.setAttribute('loading', 'lazy');
          column.classList.remove('carousel-item');
          column.style.display = 'none';
        }
      });

      if (options("tagsPosition") === 'bottom') {
        const activeElementTop = document.activeElement.getBoundingClientRect().top;
        const activeElementTopsDistance = Math.abs(activeElementOldTop - activeElementTop);

        if (activeElementTopsDistance >= 100) {
          const oldPaddingBottom = document.activeElement.style.paddingBottom;
          document.activeElement.style.paddingBottom = '25px';
          clearSaveCurrentCameraPositionSideEffects();
          document.activeElement.scrollIntoView(false);
          document.activeElement.style.paddingBottom = oldPaddingBottom;
        }
      }
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

    function initializeModalSize() {
      // * ... Work-around (4): set the modal display to flex to have a beautifully min-width: fit-content modal (also give a look to some inline styles in the generated modal HTML).
      getModalElement().style.display = 'flex';
      const modalBackDrop = document.querySelector('.modal-backdrop');
      modalBackDrop.removeEventListener('transitionend', initializeModalSize);
    }

    function generateListeners(gallery, modal) {
      const mauPrefixClass = options('mauPrefixClass');
      const galleryRootNodeId = options('galleryRootNodeId');
      const galleryElementNavLinks = gallery.querySelectorAll(`#${galleryRootNodeId} .tags-bar .${mauPrefixClass}.nav-link`);
      galleryElementNavLinks.forEach(navlink => navlink.addEventListener('click', event => filterByTag(event.target)));

      if (!options('lightBox')) {
        return;
      }

      modal.addEventListener('shown.bs.modal', (event) => {
        document.addEventListener('keydown', handleKeyDown);
        memos('shownModal', true);
        // * ... Work-around (1): force the keyboard navigation to be immediately available. Please, also give a look to Work-around n°2.
        if (!isOnMobile()) {
          const lightboxId = options('lightboxId');
          const mgNextElement = event.target.querySelector(`#${lightboxId} .mg-next`);

          if (!isOnMobile()) {
            mgNextElement.parentNode.focus();
          }
        }
      });

      modal.addEventListener('hidden.bs.modal', (event) => {
        const oldCurrentModalImg = getCurrentModalImage(event.target);
        const activeElement = memos('activeElement')

        moveCameraToSavedPosition(activeElement);
        document.removeEventListener('keydown', handleKeyDown);
        setActiveModalCarouselElement(oldCurrentModalImg, false);
        memos('shownModal', false);
        // * ... Work-around (5): set the modal display to none to be consistent with the work-around n°4.
        getModalElement().style.display = 'none';
      });

      const modalTriggerClass = options('modalTriggerClass');
      elements = gallery.querySelectorAll(`.${mauPrefixClass}.${modalTriggerClass}`);
      document.addEventListener('keydown', event => {

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
      });

      elements.forEach(element => {
        element.addEventListener('click', event => {
          event.preventDefault();
          let imgElement = event.target.querySelector('img') ?? event.target;

          if (options('lightBox') && imgElement) {
            if (imgElement.parentNode.tagName === 'PICTURE') {
              imgElement = imgElement.parentNode;
            }
            lightBoxOnOpen(modal, imgElement);
          }
        });
      });

      if (!options('navigation')) {
        return;
      }

      const modalCarousel = getModalCarouselElement();
      modalCarousel.addEventListener('slide.bs.carousel', (event) => {
        const m = document.querySelector(`#${options('lightboxId')}`);
        const modalSingletonInstance = bootstrap.Modal.getInstance(m);

        if (modalSingletonInstance && modalSingletonInstance._isTransitioning) {
          event.preventDefault();
        }
      });

      function handleKeyDown(event) {
        if (options('navigation')) {

          if (event.keyCode == 37 || event.key === 'ArrowLeft') {
            const lightboxId = options('lightboxId');
            const mgPrevElement = modal.querySelector(`#${lightboxId} .mg-prev`);
            mgPrevElement.parentNode.focus();
          }

          if (event.keyCode == 39 || event.key === 'ArrowRight') {
            const lightboxId = options('lightboxId');
            const mgNextElement = modal.querySelector(`#${lightboxId} .mg-next`);
            mgNextElement.parentNode.focus();
          }
        }
      }
    }

    function setActiveModalCarouselElement(element, activationState = true) {
      let carouselElement = null;

      if (element.parentNode.tagName === 'PICTURE') {
        carouselElement = element.parentNode.parentNode;
      } else {
        carouselElement = element.parentNode;
      }

      if (activationState) {
        const galleryItemClass = options('galleryItemClass');
        const modalCarouselElements = getModalElement().querySelectorAll(`.${options('mauPrefixClass')}.modal-${galleryItemClass}`);
        modalCarouselElements.forEach(element => element.classList.remove('active'));
        carouselElement.classList.add('active');
      } else {
        carouselElement.classList.remove('active');
      }
    }

    function lightBoxOnOpen(modal, element) {
      let providedImg = element;

      if (element.tagName === 'PICTURE') {
        providedImg = element.querySelector('img');
      }

      const modalImgs = modal.querySelectorAll('img');
      for (const modalImg of modalImgs) {
        if (modalImg.getAttribute('src') === providedImg.getAttribute('src')) {
          setActiveModalCarouselElement(modalImg);
          break;
        }
      }

      if (options('navigation')) {
        const lightboxId = options('lightboxId');
        // * ... Work-around (2): force the keyboard navigation to be immediately available as soon the focus is placed on a carousel button.
        const carouselSingletonInstance = bootstrap.Carousel.getInstance(`#${lightboxId}-carousel`) ?? new bootstrap.Carousel(`#${lightboxId}-carousel`);
        if (!isOnMobile()) {
          carouselSingletonInstance._slide(carouselSingletonInstance._directionToOrder('right'));
          carouselSingletonInstance._slide(carouselSingletonInstance._directionToOrder('left'));
        } else {
          const virtualClick = new Event('click');
          const mgNextElement = modal.querySelector(`#${lightboxId} .mg-next`);
          mgNextElement.dispatchEvent(virtualClick);
          carouselSingletonInstance._slide(carouselSingletonInstance._directionToOrder('right'));
        }
      }

      memos('screenOrientation', getScreenOrientation());

      // * ... Work-around (3): Load the modal via custom Javascript to save the good old camera position value, BEFORE drawing the modal, since at least one Bootstrap's locking screen function is glitched.
      if (!memos('tab')) {
        saveCurrentCameraPosition();
      } else {
        saveActiveElement();
        memos('curX', -1);
      }

      const lightboxId = options('lightboxId');
      const m = document.querySelector(`#${lightboxId}`);
      const modalSingletonInstance = bootstrap.Modal.getInstance(m) ?? new bootstrap.Modal(m);
      modalSingletonInstance.show();
      // * ... Work-around n°3 -> Implementation
      if (memos('curY') !== window.scrollY) {
        memos('lockScreenHasGlitched', true);
        memos('curYDelta', memos('curY') - window.scrollY);
      } else {
        memos('lockScreenHasGlitched', false);
        memos('curYDelta', 0);
      }

      const modalBackDrop = document.querySelector('.modal-backdrop');
      modalBackDrop.addEventListener('transitionend', initializeModalSize);
    }

    function createLightBox(gallery) {
      const lightboxId = options('lightboxId');
      const navigation = options('navigation');
      const prevImgBtnLabel = options('prevImgButtonLabel');
      const nextImgBtnLabel = options('nextImgButtonLabel');
      const mauPrefixClass = options('mauPrefixClass');
      const htmlAttributesWhitelist = ['src', 'alt', 'srcset', 'sizes', 'data-gallery-tag'];

      let carouselInner = '';
      getRichGalleryItems().forEach(galleryItem => {
        let currentElement = null;

        if (galleryItem.picture) {
          currentElement = galleryItem.picture.cloneNode(deep = true);
          initializeModalImg(currentElement.querySelector('img'), htmlAttributesWhitelist);
        } else if (galleryItem.item.tagName === 'IMG') {
          currentElement = galleryItem.item.cloneNode(deep = true);
          initializeModalImg(currentElement, htmlAttributesWhitelist);
        }

        if (currentElement) {
          const galleryItemClass = options('galleryItemClass');
          const wrappedCurrentElement = wrap(currentElement, `<div class="carousel-item mau modal-${galleryItemClass}" style="transition: all 0s !important">`, '</div>');
          carouselInner += wrappedCurrentElement.outerHTML;
        }
      });

      const lightbox = `
        <div class="${mauPrefixClass} modal fade" id="${lightboxId}" tabindex="-1" role="dialog" aria-hidden="true" style="user-select:none;-webkit-user-select:none;">
          <div class="modal-dialog" role="document" style="margin:auto;max-width:unset;">
            <div class="modal-content" style="min-width:fit-content !important;">
              <div class="modal-body">
                <div id="${lightboxId}-carousel" class="carousel" ${!navigation ? 'data-bs-touch="false"' : ''}>
                  <div class="carousel-inner">
                    ${carouselInner}
                  </div>
                  ${navigation
                  ? `<button class="carousel-control-prev" type="button" data-bs-target="#${lightboxId}-carousel" data-bs-slide="prev" style="touch-action:manipulation">
                       <span class="carousel-control-prev-icon mau mg-prev" aria-hidden="true"></span>
                       <span class="visually-hidden">${prevImgBtnLabel}</span>
                     </button>
                     <button class="carousel-control-next" type="button" data-bs-target="#${lightboxId}-carousel" data-bs-slide="next" style="touch-action:manipulation">
                       <span class="carousel-control-next-icon mau mg-next" aria-hidden="true"></span>
                       <span class="visually-hidden">${nextImgBtnLabel}</span>
                     </button>`
                  : ''
                  }
                </div>
              </div>
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
      const modalArrowBoxesSize = modalNavigation['arrowBoxesSizeObj'].size;
      const modalArrowBoxesSizeUnit = modalNavigation['arrowBoxesSizeObj'].unit;
      const modalArrowBoxesSizeHalf = Math.trunc(modalArrowBoxesSize / 2);

      const animationRuleValue = `${animationName} ${animationDurationOnFilter} ${animationEasing}`;
      const modalAnimationRuleValue = `${animationName} ${animationDurationOnModalAppear} ${animationEasing}`;

      const mauPrefixClass = options('mauPrefixClass');
      const lightboxId = options('lightboxId');
      const galleryItemsRowId = options('galleryItemsRowId');
      const galleryItemClass = options('galleryItemClass');
      const modalArrowSizeRuleValue = modalArrowBoxesSize + modalArrowBoxesSizeUnit;
      const modalArrowHalfSizeRuleValue = modalArrowBoxesSizeHalf + modalArrowBoxesSizeUnit;

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
            --_nav-btns-delta: calc(${modalArrowSizeRuleValue} * .2);
            display: block;
            position: absolute;
            bottom: calc(50% - ${modalArrowHalfSizeRuleValue});
            width: ${modalArrowSizeRuleValue};
            height: ${modalArrowSizeRuleValue};
            border-radius: 0;
            transition: left ${arrowTransitionDelay}, right ${arrowTransitionDelay};
          }`,
        'navigationButtonRight': `
          .${mauPrefixClass}.mg-next {
            --_negative-value: -${modalArrowSizeRuleValue};
            --_right: calc(var(--_negative-value) - var(--_nav-btns-delta));
            right: var(--_right)
          }`,
        'navigationButtonLeft': `
          .${mauPrefixClass}.mg-prev {
            --_negative-value: -${modalArrowSizeRuleValue};
            --_left: calc(var(--_negative-value) - var(--_nav-btns-delta));
            left: var(--_left);
          }`,
        'disableBootstrapCarouselControlClickableAreaOnModal': `
          #${lightboxId} .carousel-control-prev, #${lightboxId} .carousel-control-next {
            width: 0;
          }`,
        'hotfix_a': `
          .${mauPrefixClass}.item-column {
            position: relative;
            margin-bottom: 0 !important;
            padding: 0;
          }`,
        'hotfix_b': `
          .${mauPrefixClass}.item-column::after {
            content: "";
            position: relative;
            z-index: -1000;
            display: block;
            padding-bottom: 100%;
          }`,
        'hotfix_c': `
          .${mauPrefixClass}.${galleryItemClass} {
            position: absolute;
            width: 100%;
            height: 100%;
            object-fit: cover;
            padding: .5em;
          }`,
        'navigationButtonsResponsive': `
          @media (max-width: 1000px) {
            .${mauPrefixClass}.mg-next, .${mauPrefixClass}.mg-prev {
              left: calc(var(--_left) / 12);
              right: calc(var(--_right) / 12);
              margin: 0 calc(var(--_nav-btns-delta) / 2);
              transition: left ${arrowTransitionDelay}, right ${arrowTransitionDelay};
            }
            #${lightboxId} .carousel-control-prev, #${lightboxId} .carousel-control-next {
              width: 15%;
            }
          }`
      };

      if (isOnMobile()) {
        const galleryRootNodeId = options('galleryRootNodeId');
        const mobileRules = {
          'disableFocusOutlineOnGalleryImages': `
            #${galleryRootNodeId} .${mauPrefixClass}.item-column a:focus {
              outline-style: none;
              box-shadow: none;
              border-color: transparent;
            }`
        }
        Object.assign(rules, mobileRules);
      }
      Object.keys(rules).reverse().forEach(key => style.sheet.insertRule(rules[key].replace(/ +/g, ' '), 0));
    }

    function process() {
      appendCSS();

      const galleryRootNodeId = options('galleryRootNodeId');
      const mauPrefixClass = options('mauPrefixClass');
      const galleryItemClass = options('galleryItemClass');
      const lightBox = options('lightBox');
      const target = document.querySelector(`#${galleryRootNodeId}`);
      createRowWrapper(target);

      target.querySelectorAll(`.${mauPrefixClass}.${galleryItemClass}`).forEach(item => {
        if (item.parentNode.tagName === 'PICTURE') {
          item = item.parentNode;
        }
        generateRowWrapper(target, item);
      });

      if (lightBox) {
        createLightBox(target);
      }

      if (options('showTags')) {
        showItemTags(target);
      }

      const modal = getModalElement();
      generateListeners(target, modal);
    }

    process();
  }

  function run(opt) {
    Object.assign(options(), opt);
    Object.freeze(options());
    injectMau(props);
  }

  run(opt);
}
