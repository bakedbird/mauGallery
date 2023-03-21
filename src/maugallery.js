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
          'arrowBoxesSizeObj': { size: '50', unit: 'px' },
          'forcedFontSize': null
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
      'activeElement': null,
      'activeElementAbsoluteY': null,
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

    function isInViewport(element) {
      const height = parseInt(window.getComputedStyle(element).height, 10) - 1;
      const width = parseInt(window.getComputedStyle(element).width, 10) - 1;
      const rect = element.getBoundingClientRect();
      const computedUpPx = rect.bottom - height;
      const computedLeftPx = rect.right - width;
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        (computedUpPx <= window.innerHeight && computedLeftPx <= window.innerWidth) ||
        (rect.bottom <= window.innerHeight && rect.right <= window.innerWidth)
      );
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

    function saveCurrentCameraPosition() {
      memos('scrollBehavior', document.documentElement.style.scrollBehavior);
      memos('curX', window.scrollX);
      memos('curY', window.scrollY);
      const activeElement = document.activeElement;
      if (activeElement) {
        memos('activeElement', activeElement);
        memos('activeElementAbsoluteY', getAbsoluteElementY(activeElement));
      }
      document.documentElement.style.scrollBehavior = 'smooth !important;'
    }

    function moveCameraToSavedPosition(activeElement = null) {
      function scrollToActiveElement(activeElement, currentY, oldY) {
        const activeElementOldPaddingTop = activeElement.style.paddingTop;
        const activeElementOldPaddingBottom = activeElement.style.paddingBottom;
        if (currentY > oldY) {
          activeElement.style.paddingBottom = '15px';
          activeElement.scrollIntoView(false);
        } else {
          activeElement.style.paddingTop = '15px';
          activeElement.scrollIntoView(true);
        }
        activeElement.style.paddingTop = activeElementOldPaddingTop;
        activeElement.style.paddingBottom = activeElementOldPaddingBottom;
      }

      if (activeElement) {
        const currentY = getAbsoluteElementY(activeElement);
        const oldY = memos('activeElementAbsoluteY');
        const distance = Math.abs(oldY - currentY);
        const computedElementHeight = parseInt(window.getComputedStyle(activeElement).height, 10);
        if (!isInViewport(activeElement) || distance >= computedElementHeight) {
          scrollToActiveElement(activeElement, currentY, oldY);
        } else {
          snapCamera(memos('curX'), memos('curY'));
        }
      } else {
        snapCamera(memos('curX'), memos('curY'));
      }
      clearSaveCurrentCameraPositionSideEffects();
    }

    function wrapItemInColumn(element) {
      function doWrap(element, wrapperOpen, wrapperClose) {
        orgHtml = element.outerHTML;
        newHtml = wrapperOpen + orgHtml + wrapperClose;
        element.outerHTML = newHtml;
      }

      const lightBox = options('lightBox');
      const columns = options('columns');
      const mauPrefixClass = options('mauPrefixClass');
      const lightboxId = options('lightboxId');
      const modalTriggerClass = options('modalTriggerClass');
      const isImg = element.tagName === 'IMG' || element.tagName === 'PICTURE';
      const injectModalTrigger = lightBox ? `data-bs-toggle="modal" data-bs-target=".${mauPrefixClass}#${lightboxId}" class="${mauPrefixClass} ${modalTriggerClass}"` : '';
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
        doWrap(element, wrapperOpen, wrapperClose);
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
      if (!isOnMobile()) {
        element.style.maxHeight = '85vh';
      }
    }

    function buildImagesCollection(modal) {
      const mauPrefixClass = options('mauPrefixClass');
      const filtersActiveTagId = options('filtersActiveTagId');
      const activeTag = !options('showTags') ? 'all' : document.querySelector(`.${mauPrefixClass}#${filtersActiveTagId}`).dataset.imagesToggle;
      const attributeFilter = activeTag === 'all' ? '' : `[data-gallery-tag="${activeTag}"]`;
      const galleryItems = modal.querySelectorAll(`img.${mauPrefixClass}${attributeFilter}`);

      return galleryItems;
    }

    function getCurrentModalImage(modal) {
      return modal.querySelector(`#${options('lightboxImgId')}`);
    }

    function getMgElements(modal) {
      const lightboxId = options('lightboxId');
      const mgElements = {
        'mgPrev': modal.querySelector(`#${lightboxId} .mg-prev`),
        'mgNext': modal.querySelector(`#${lightboxId} .mg-next`)
      }
      return mgElements;
    }

    function expandModalNavigationArrows(modal) {
      const mgElements = getMgElements(modal);

      Object.keys(mgElements).forEach(key => {
        mgElements[key].style.left = null;
        mgElements[key].style.right = null;
        mgElements[key].style.margin = null;
      });
    }

    function collapseModalNavigationArrows(modal) {
      const mgElements = getMgElements(modal);

      Object.keys(mgElements).forEach(key => {
        mgElements[key].style.left = 'calc(var(--_left) / 12)';
        mgElements[key].style.right = 'calc(var(--_right) / 12)';
        mgElements[key].style.margin = '0 calc(var(--_delta) / 2)';
      });
    }

    function computeModalNavigationArrowsPosition(modal, newModalDialogMaxWidth) {
      if (!options('navigation')) {
        return;
      }

      if (isOnMobile()) {
        collapseModalNavigationArrows(modal);
        return;
      }

      const delta = props.options.styles.modal.navigation.arrowBoxesSizeObj.size * 1.5;
      if (window.innerWidth - delta < parseInt(newModalDialogMaxWidth, 10)) {
        collapseModalNavigationArrows(modal);
      } else {
        expandModalNavigationArrows(modal);
      }
    }

    function updateModalSize(modal) {
      if (isOnMobile()) {
        collapseModalNavigationArrows(modal);
        return;
      }

      const currentWidth = window.innerWidth;
      const modalDialog = modal.querySelector('.modal-dialog');
      if (currentWidth < 576) {
        modalDialog.style.maxWidth = null;
        return;
      }
      const imgElement = getCurrentModalImage(modal);
      modalDialog.style.maxWidth = '100vw';
      const newImgWidth = window.getComputedStyle(imgElement).width;
      const newModalDialogMaxWidth = newImgWidth;
      modalDialog.style.maxWidth = newModalDialogMaxWidth;
      computeModalNavigationArrowsPosition(modal, newModalDialogMaxWidth);
    }

    function updateModalImg(modal, newModalImg) {
      const oldModalImg = getCurrentModalImage(modal);
      setGalleryImgToOn(newModalImg);
      setGalleryImgToOff(oldModalImg);
      oldModalImg.removeAttribute('id');
      newModalImg.id = options('lightboxImgId');
      updateModalSize(modal);
    }

    function prevImage(modal) {
      if (!options('navigation')) {
        return;
      }

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
      if (!options('navigation')) {
        return;
      }

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
      let activeElementOldTop = null;

      if (options("tagsPosition") === 'bottom') {
        activeElementOldTop = document.activeElement.getBoundingClientRect().top;
      }

      richGalleryItems.forEach(richItem => {
        if (tag === 'all' || richItem.item.dataset.galleryTag === tag) {
          richItem.column.style.display = 'block';
        } else {
          richItem.column.style.display = 'none';
        }
        if (options("tagsPosition") === 'top') {
          moveCameraToSavedPosition();
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
      const modal = getModalElement();
      updateModalSize(modal);
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
      modal.addEventListener('shown.bs.modal', () => {
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleResize);
        memos('shownModal', true);
      });

      modal.addEventListener('hidden.bs.modal', () => {
        if (options('navigation')) {
          const buttons = modal.querySelectorAll('button');
          buttons.forEach(button => button.removeAttribute('tabindex'));
        }
        const oldCurrentModalImg = getCurrentModalImage(modal);
        const activeElement = memos('activeElement')

        moveCameraToSavedPosition(activeElement);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', handleResize);
        setGalleryImgToOff(oldCurrentModalImg);
        oldCurrentModalImg.removeAttribute('id');
        memos('shownModal', false);
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
      })

      elements.forEach(element => {
        element.addEventListener('click', event => {
          event.preventDefault();
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

      if (!options('navigation')) {
        return;
      }

      function handleSwipe() {
        const ms = [memos('touchendX'), memos('touchendY'), memos('touchstartX'), memos('touchstartY')];
        if (!memos('shownModal') || ms.some(m => m === null)) {
          return;
        }
        const Xdistance = Math.abs(memos('touchendX') - memos('touchstartX'));
        if (Xdistance < 30) {
          return;
        }
        const angle = Math.atan2(memos('touchendY') - memos('touchstartY'), memos('touchendX') - memos('touchstartX')) * 180 / Math.PI;
        if (angle >= -30 && angle <= 30) {
          const modal = getModalElement();
          nextImage(modal);
        }
        if ((angle >= -179 && angle <= -149) || (angle >= 150 && angle <= 180)) {
          const modal = getModalElement();
          prevImage(modal);
        }
      }

      if (isOnMobile()) {
        modal.addEventListener('touchstart', e => {
          if (e.touches.length !== 1) {
            memos('touchstartX', null);
            memos('touchstartY', null);
            return;
          }
          memos('touchstartX', e.changedTouches[0].screenX);
          memos('touchstartY', e.changedTouches[0].screenY);
        });

        modal.addEventListener('touchend', e => {
          memos('touchendX', e.changedTouches[0].screenX);
          memos('touchendY', e.changedTouches[0].screenY);
          handleSwipe();
        });
      }

      function handleResize() {
        const modal = getModalElement();
        updateModalSize(modal);
      }

      function handleKeyDown(event) {
        if (event.keyCode == 37 || event.key === 'ArrowLeft') {
          if (options('navigation')) {
            prevImage(modal);
            const lightboxId = options('lightboxId');
            const mgPrevElement = modal.querySelector(`#${lightboxId} .mg-prev`);
            mgPrevElement.focus();
          }
        }
        if (event.keyCode == 39 || event.key === 'ArrowRight') {
          if (options('navigation')) {
            nextImage(modal);
            const lightboxId = options('lightboxId');
            const mgNextElement = modal.querySelector(`#${lightboxId} .mg-next`);
            mgNextElement.focus();
          }
        }
      }

      const lightboxId = options('lightboxId');
      const galleryElementMgPrev = gallery.querySelector(`#${lightboxId} .mg-prev`);
      const galleryElementMgNext = gallery.querySelector(`#${lightboxId} .mg-next`);

      galleryElementMgPrev.addEventListener('click', () => prevImage(modal));
      galleryElementMgNext.addEventListener('click', () => nextImage(modal));
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
      const dynamicModalDialogWidth = !isOnMobile() ? 'style="max-width:100vw"' : '';
      const lightbox = `
        <div class="${mauPrefixClass} modal fade" id="${lightboxId}" tabindex="-1" role="dialog" aria-hidden="true" style="user-select:none;-webkit-user-select:none;">
          <div class="modal-dialog modal-dialog-centered" role="document" ${dynamicModalDialogWidth}>
            <div class="modal-content" style="border-width:16px;border-color:#fff;background-clip:unset;">
              <div class="modal-body" style="padding:0">
                ${allOuterHTML}
              </div>
              ${navigation ? `<button aria-label="${prevImgBtnLabel}" class="mg-prev" style="touch-action:manipulation;border:none;background:#fff;"><span><</span></button>` : '<span style="display:none;" />'}
              ${navigation ? `<button aria-label="${nextImgBtnLabel}" class="mg-next" style="touch-action:manipulation;border:none;background:#fff;"><span>></span></button>` : '<span style="display:none;" />'}
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
      const modalNavigationFontSize = modalNavigation['forcedFontSize'];
      const modalArrowBoxesSize = modalNavigation['arrowBoxesSizeObj'].size;
      const modalArrowBoxesSizeUnit = modalNavigation['arrowBoxesSizeObj'].unit;
      const modalArrowBoxesSizeHalf = Math.trunc(modalArrowBoxesSize / 2);

      const animationRuleValue = `${animationName} ${animationDurationOnFilter} ${animationEasing}`;
      const modalAnimationRuleValue = `${animationName} ${animationDurationOnModalAppear} ${animationEasing}`;

      const mauPrefixClass = options('mauPrefixClass');
      const lightboxId = options('lightboxId');
      const galleryItemsRowId = options('galleryItemsRowId');
      const modalArrowSizeRuleValue = modalArrowBoxesSize + modalArrowBoxesSizeUnit;
      const modalArrowHalfSizeRuleValue = modalArrowBoxesSizeHalf + modalArrowBoxesSizeUnit;

      const fontSize = modalNavigationFontSize ?? modalArrowHalfSizeRuleValue;

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
          #${lightboxId} .mg-next, #${lightboxId} .mg-prev {
            display: block;
            position: absolute;
            bottom: calc(50% - ${modalArrowHalfSizeRuleValue});
            width: ${modalArrowSizeRuleValue};
            height: ${modalArrowSizeRuleValue};
            border-radius: 0;
            font-size: ${fontSize};
            transition: left ${arrowTransitionDelay}, right ${arrowTransitionDelay};
          }`,
        'navigationButtonRight': `
          #${lightboxId} .mg-next {
            --_delta: calc(${modalArrowSizeRuleValue} * .1);
            --_negative-value: -${modalArrowSizeRuleValue};
            --_right: calc(var(--_negative-value) - var(--_delta));
            right: var(--_right)
          }`,
        'navigationButtonLeft': `
          #${lightboxId} .mg-prev {
            --_delta: calc(${modalArrowSizeRuleValue} * .1);
            --_negative-value: -${modalArrowSizeRuleValue};
            --_left: calc(var(--_negative-value) - var(--_delta));
            left: var(--_left);
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
      const galleryRootNodeId = options('galleryRootNodeId');
      const mauPrefixClass = options('mauPrefixClass');
      const galleryItemClass = options('galleryItemClass');
      const lightBox = options('lightBox');
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
