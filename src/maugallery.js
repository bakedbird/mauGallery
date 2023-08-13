// * ... Prefix Class
let _mauGalleryManager = {
  'mauGalleryGlobalConfig': {
    'mauPrefixClass': _asyncMauGalleryLauncher.Launcher_Instance.globalMauGalleryConfig['mauPrefixClass']
  }
};

// * ... Default global config
Object.assign(_mauGalleryManager['mauGalleryGlobalConfig'], {
  'lightboxId': `${_mauGalleryManager['mauPrefixClass']}-lightbox`,
  'anyImageServedByHTTP1Server': true,
  'prevImgButtonLabel': 'Previous image',
  'nextImgButtonLabel': 'Next image',
  'disableFiltersButtonLabel': 'All',
  'modalTriggerClass': 'modal-trigger',
  'galleryItemClass': 'gallery-item',
  'modalWrapperClass': 'modal-component',
  'galleryPlaceHolderClass': 'gallery-placeholder',
  'styles': {
    'animation': {
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
});

// * ... Utilitary functions
Object.assign(_mauGalleryManager, {
  'objReader': (obj, key = undefined) => {
    if (key === undefined) {
      return obj;
    }

    if (!(key in obj)) {
      throw new Error(`No value found for key: ${key}`);
    }

    const value = obj[key];
    return value;
  },

  'objWriter': (obj, key, value) => {
    if (!(key in obj)) {
      throw new Error(`No value found for key: ${key}`);
    }

    obj[key] = value;
  },

  'objAccessor': (obj, key = undefined, value = undefined) => {
    if (key === undefined) {
      return obj;
    }

    if (!(key in obj)) {
      throw new Error(`No value found for key: ${key}`);
    }

    if (value === undefined) {
      return _mauGalleryManager.objReader(obj, key);
    } else {
      _mauGalleryManager.objWriter(obj, key, value);
      return void 0;
    }
  }
});

// * ... Accessors
Object.assign(_mauGalleryManager, {
  'options': (key = undefined) => {
    return _mauGalleryManager.objReader(_mauGalleryManager['mauGalleryGlobalConfig'], key);
  }
});

// * ... Cache
Object.assign(_mauGalleryManager, {
  'Cache':
    class Cache {
      constructor() {
        this.imgUrlsCache = new Set();
      }

      cacheImgUrl(url) {
        if (_mauGalleryManager.options('anyImageServedByHTTP1Server')) {
          return;
        }
        if (url === null || this.imgUrlsCache.has(url)) {
          return;
        }
        const isValid = (token) => token.indexOf('/') !== -1 || token.indexOf('.') !== -1;
        if (!isValid(url)) {
          return;
        }
        fetch(url);
        this.imgUrlsCache.add(url);
      }

      cacheMultipleImgUrls(tokensList) {
        if (tokensList === null) {
          return;
        }
        tokensList.forEach(token => this.cacheImgUrl(token));
      }
    }
});

// * ... Mobile
Object.assign(_mauGalleryManager, {
  'Mobile':
    class Mobile {
      constructor() {
        this.onMobile = null;
        this.screenOrientation = null;
      }

      isOnMobile(lazy = true) {
        if (!lazy || this.onMobile === null) {
          const userAgent = navigator.userAgent.toLowerCase();
          this.onMobile = userAgent.match(/(ipad)|(iphone)|(ipod)|(android)|(webos)|(blackberry)|(tablet)|(kindle)|(playbook)|(silk)|(windows phone)/i);
        }
        return this.onMobile;
      }

      getCurrentScreenOrientation() {
        let screenOrientation = null;
        if (!this.isOnMobile()) {
          return null;
        }

        if (window.innerWidth < window.innerHeight) {
          screenOrientation = 'p';
        } else {
          screenOrientation = 'l';
        }
        this.screenOrientation = screenOrientation;
        return screenOrientation;
      }

      getSavedScreenOrientation() {
        return this.screenOrientation;
      }
    }
});

// * ... Modal
Object.assign(_mauGalleryManager, {
  'Modal':
    class Modal {
      constructor() { }

      createModal(relatedGalleryInstance) {
        function doCreateModal() {
          const lightboxId = _mauGalleryManager.options('lightboxId');
          const prevImgBtnLabel = _mauGalleryManager.options('prevImgButtonLabel');
          const nextImgBtnLabel = _mauGalleryManager.options('nextImgButtonLabel');
          const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
          const modalWrapperClass = _mauGalleryManager.options('modalWrapperClass');

          const lightbox =
            `<div class="${mauPrefixClass} ${modalWrapperClass}">
               <div class="${mauPrefixClass} modal fade" id="${lightboxId}" tabindex="-1" role="dialog" aria-hidden="true" style="user-select:none;-webkit-user-select:none;">
                 <div class="modal-dialog" role="document" style="margin:auto;max-width:unset;">
                   <div class="modal-content" style="min-width:fit-content !important;">
                     <div class="modal-body">
                       <div id="${lightboxId}-carousel" class="carousel">
                         <div class="carousel-inner">
                         </div>
                         <button aria-label="${prevImgBtnLabel}" class="d-block carousel-control-prev" type="button" data-bs-target="#${lightboxId}-carousel" data-bs-slide="prev" style="display:none;touch-action:manipulation;">
                           <span class="carousel-control-prev-icon ${mauPrefixClass} mg-prev" aria-hidden="true"></span>
                         </button>
                         <button aria-label="${nextImgBtnLabel}" class="d-block carousel-control-next" type="button" data-bs-target="#${lightboxId}-carousel" data-bs-slide="next" style="display:none;touch-action:manipulation;">
                           <span class="carousel-control-next-icon ${mauPrefixClass} mg-next" aria-hidden="true"></span>
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>`;
          document.body.innerHTML = document.body.innerHTML + lightbox;
        }

        function generateModalEventListeners(modal, modalCarousel) {
          modal.addEventListener('shown.bs.modal', (event) => {
            // * ... Work-around (1): force the keyboard navigation to be immediately available. Please, also give a look to Work-around n°2.
            const mobileInstance = _mauGalleryManager['Mobile_Instance'];
            if (!mobileInstance.isOnMobile()) {
              const lightboxId = _mauGalleryManager.options('lightboxId');
              const mgNextElement = event.target.querySelector(`#${lightboxId} .mg-next`);
              mgNextElement.parentNode.focus();
            }
          });

          modal.addEventListener('hidden.bs.modal', (event) => {
            const modalInstance = _mauGalleryManager['Modal_Instance'];
            const cameraInstance = _mauGalleryManager['Camera_Instance'];
            const oldCurrentModalImg = modalInstance.getCurrentModalImage(event.target);

            cameraInstance.moveCameraToSavedPosition();
            modalInstance.setActiveModalCarouselElement(oldCurrentModalImg, false);
            modalInstance.getModalElement().style.display = 'none'; // * ... Work-around (5): set the modal display to none to be consistent with the work-around n°4.
            cameraInstance.memos('activeGalleryPicture', null);
          });

          modalCarousel.addEventListener('slide.bs.carousel', (event) => {
            // * ... Bootstrap Hotfix
            if (event.target.dataset.bsTouch === 'false') {
              event.preventDefault();
            }

            const m = document.querySelector(`#${_mauGalleryManager.options('lightboxId')}`);
            const bsModalSingletonInstance = bootstrap.Modal.getInstance(m);

            if (bsModalSingletonInstance && bsModalSingletonInstance._isTransitioning) {
              event.preventDefault();
            }
          });
        }

        function appendModalCarouselElements(modalCarouselElement, carouselElements) {
          const modalCarouselInnerElement = modalCarouselElement.querySelector('.carousel-inner');
          carouselElements.forEach(element => modalCarouselInnerElement.append(element));
        }

        const noModalInstance = !this.getModalElement();
        if (noModalInstance) {
          doCreateModal();
          generateModalEventListeners(this.getModalElement(), this.getModalCarouselElement());
        }

        const htmlAttributesWhitelist = ['src', 'alt', 'srcset', 'sizes', 'data-gallery-tag', 'data-related-gallery-id'];

        const carouselElements = [];
        relatedGalleryInstance.getRichGalleryItems().forEach(galleryItem => {
          let currentElement = null;

          const isDeepCopy = true;
          if (galleryItem.picture) {
            currentElement = galleryItem.picture.cloneNode(isDeepCopy);
            this.initializeModalImg(currentElement.querySelector('img'), htmlAttributesWhitelist);
          } else if (galleryItem.item.tagName === 'IMG') {
            currentElement = galleryItem.item.cloneNode(isDeepCopy);
            this.initializeModalImg(currentElement, htmlAttributesWhitelist);
          }

          if (currentElement) {
            const galleryItemClass = _mauGalleryManager.options('galleryItemClass');
            const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
            const wrappedElement = document.createElement('div');
            wrappedElement.classList.add(mauPrefixClass, 'carousel-item', `modal-${galleryItemClass}`);
            wrappedElement.append(currentElement);
            carouselElements.push(wrappedElement);
          }
        });
        appendModalCarouselElements(this.getModalCarouselElement(), carouselElements);
      }

      getModalElement() {
        const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
        const lightboxId = _mauGalleryManager.options('lightboxId');
        const modal = document.querySelector(`.${mauPrefixClass}#${lightboxId}`);
        return modal;
      }

      getCurrentModalImage(modal) {
        const galleryItemClass = _mauGalleryManager.options('galleryItemClass');
        const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
        return modal.querySelector(`.${mauPrefixClass}.modal-${galleryItemClass}.active img`);
      }

      getModalCarouselElement() {
        const modalCarousel = document.querySelector(`#${_mauGalleryManager.options('lightboxId')}-carousel`);
        return modalCarousel;
      }

      setActiveModalCarouselElement(element, activationState = true) {
        let carouselElement = null;
        if (element.parentNode.tagName === 'PICTURE') {
          carouselElement = element.parentNode.parentNode;
        } else {
          carouselElement = element.parentNode;
        }

        if (activationState) {
          const galleryItemClass = _mauGalleryManager.options('galleryItemClass');
          const modalCarouselElements = this.getModalElement().querySelectorAll(`.${_mauGalleryManager.options('mauPrefixClass')}.modal-${galleryItemClass}`);
          modalCarouselElements.forEach(element => element.classList.remove('active'));
          carouselElement.classList.add('active');
        } else {
          carouselElement.classList.remove('active');
        }
      }

      initializeModalImg(element, htmlAttributesWhitelist) {
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
        element.className = `${_mauGalleryManager.options('mauPrefixClass')} img-fluid`;
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

      initializeModalSize() {
        // * ... Work-around (4): set the modal display to flex to have a beautifully min-width: fit-content modal (also give a look to some inline styles in the generated modal HTML).
        const modalInstance = _mauGalleryManager['Modal_Instance'];
        modalInstance.getModalElement().style.display = 'flex';
        const modalBackDrop = document.querySelector('.modal-backdrop');
        modalBackDrop.removeEventListener('transitionend', modalInstance.initializeModalSize);
      }

      updateModalCarouselComponent(relatedGalleryInstance) {
        if (!relatedGalleryInstance.options('lightBox')) {
          return;
        }

        let tag = relatedGalleryInstance.memos('currentTag');
        if (tag === null) {
          tag = 'all';
        }

        const relatedGalleryId = relatedGalleryInstance.id;
        const modalCarousel = this.getModalCarouselElement();
        const galleryItemClass = _mauGalleryManager.options('galleryItemClass');
        const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
        const modalCarouselColumns = modalCarousel.querySelectorAll(`.${mauPrefixClass}.modal-${galleryItemClass}`);
        modalCarouselColumns.forEach(column => {
          const item = column.querySelector('img');
          const itemRelatedGalleryId = parseInt(item.dataset.relatedGalleryId, 10);
          if (itemRelatedGalleryId === relatedGalleryId && (tag === 'all' || item.dataset.galleryTag === tag)) {
            item.removeAttribute('loading');
            if (item.parentNode.tagName === 'PICTURE') {
              const sources = item.parentNode.querySelectorAll('source');
              sources.forEach(source => {
                const sourcesString = source.srcset;
                const sourcesTokens = sourcesString ? sourcesString.split(/[\s]+/) : null;
                _mauGalleryManager['Cache_Instance'].cacheMultipleImgUrls(sourcesTokens);
              });
            } else {
              const sourcesString = item.srcset;
              const sourcesTokens = sourcesString ? sourcesString.split(/[\s]+/) : null;
              _mauGalleryManager['Cache_Instance'].cacheMultipleImgUrls(sourcesTokens);
            }
            _mauGalleryManager['Cache_Instance'].cacheImgUrl(item.src);
            column.classList.add('carousel-item');
            column.style.display = null;
          } else {
            item.setAttribute('loading', 'lazy');
            column.classList.remove('carousel-item');
            column.style.display = 'none';
          }
        });
      }

      modalOnOpen(element, relatedMauGalleryInstance) {
        function saveCameraInformations() {
          const cameraInstance = _mauGalleryManager['Camera_Instance'];
          cameraInstance.saveCurrentCameraPosition();
        }

        // * ... Work-around n°3 -> Implementation
        function lockscreenHotfix() {
          const cameraInstance = _mauGalleryManager['Camera_Instance'];
          if (cameraInstance.memos('oldY') !== window.scrollY) {
            cameraInstance.memos('lockScreenHasGlitched', true);
            cameraInstance.memos('oldYDelta', cameraInstance.memos('oldY') - window.scrollY);
          } else {
            cameraInstance.memos('lockScreenHasGlitched', false);
            cameraInstance.memos('oldYDelta', 0);
          }
        }

        saveCameraInformations();
        this.updateModalCarouselComponent(relatedMauGalleryInstance);
        let providedImg = element;
        if (element.tagName === 'PICTURE') {
          providedImg = element.querySelector('img');
        }
        const modal = this.getModalElement();
        const modalImgs = modal.querySelectorAll('img');
        for (const modalImg of modalImgs) {
          if (modalImg.dataset.relatedGalleryId === providedImg.dataset.relatedGalleryId && modalImg.getAttribute('src') === providedImg.getAttribute('src')) {
            this.setActiveModalCarouselElement(modalImg);
            break;
          }
        }

        const lightboxId = _mauGalleryManager.options('lightboxId');
        const lightboxButtons = document.querySelectorAll(`#${lightboxId} button`);
        const carouselElement = this.getModalCarouselElement();
        const carouselItemElements = carouselElement.querySelectorAll('.carousel-item');
        const singleItemElement = carouselItemElements.length === 1;

        if (!singleItemElement && relatedMauGalleryInstance.options('navigation')) {
          carouselElement.removeAttribute('data-bs-touch');
          lightboxButtons.forEach(button => {
            button.removeAttribute('aria-hidden');
            button.classList.add('d-block');
          });
          // * ... Work-around (2): force the keyboard navigation to be immediately available as soon the focus is placed on a carousel button.
          const bsCarouselSingletonInstance = bootstrap.Carousel.getInstance(`#${lightboxId}-carousel`) ?? new bootstrap.Carousel(`#${lightboxId}-carousel`);
          if (!_mauGalleryManager['Mobile_Instance'].isOnMobile()) {
            bsCarouselSingletonInstance._slide(bsCarouselSingletonInstance._directionToOrder('right'));
            bsCarouselSingletonInstance._slide(bsCarouselSingletonInstance._directionToOrder('left'));
          } else {
            const virtualClick = new Event('click');
            const mgNextElement = modal.querySelector(`#${lightboxId} .mg-next`);
            mgNextElement.dispatchEvent(virtualClick);
            bsCarouselSingletonInstance._slide(bsCarouselSingletonInstance._directionToOrder('right'));
          }
        } else {
          carouselElement.setAttribute('data-bs-touch', 'false');
          lightboxButtons.forEach(button => {
            button.setAttribute('aria-hidden', 'true');
            button.classList.remove('d-block');
          });
        }

        // * ... Work-around (3): Load the modal via custom Javascript to save the good old camera position value, BEFORE drawing the modal, since at least one Bootstrap's locking screen function is glitched.
        const m = document.querySelector(`#${lightboxId}`);
        const bsModalSingletonInstance = bootstrap.Modal.getInstance(m) ?? new bootstrap.Modal(m);
        bsModalSingletonInstance.show();
        lockscreenHotfix(); // * ... Work-around n°3 -> Hotfix call

        const modalBackDrop = document.querySelector('.modal-backdrop');
        const modalInstance = _mauGalleryManager['Modal_Instance'];
        modalBackDrop.addEventListener('transitionend', modalInstance.initializeModalSize);
      }
    }
});

// * ... DOM Manipulations
Object.assign(_mauGalleryManager, {
  'DOM_Manipulations':
    class DOM_Manipulations {
      constructor() {
        this.memoRect = null;
      }

      getAbsoluteElementY(element) {
        const bodyRect = document.body.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const offset = elementRect.top - bodyRect.top;
        return offset;
      }

      getElementHeight(element) {
        return parseFloat(window.getComputedStyle(element).height, 10);
      }

      getElementWidth(element) {
        return parseFloat(window.getComputedStyle(element).width, 10);
      }

      getElementBottomPx(element, lazy = false) {
        const rect = lazy && this.memoRect ? this.memoRect : element.getBoundingClientRect();
        this.memoRect = rect;
        return rect.bottom;
      }

      getElementLeftPx(element, lazy = false) {
        const rect = lazy && this.memoRect ? this.memoRect : element.getBoundingClientRect();
        this.memoRect = rect;
        return rect.left;
      }

      getElementRightPx(element, lazy = false) {
        const rect = lazy && this.memoRect ? this.memoRect : element.getBoundingClientRect();
        this.memoRect = rect;
        return rect.right;
      }

      getElementTopPx(element, lazy = false) {
        const rect = lazy && this.memoRect ? this.memoRect : element.getBoundingClientRect();
        this.memoRect = rect;
        return rect.top;
      }

      isInViewport(element, options = {}) {
        const computedUpPx = this.getElementTopPx(element);
        const beLazy = true;
        const computedDownPx = this.getElementBottomPx(element, beLazy);
        const computedLeftPx = this.getElementLeftPx(element, beLazy);
        const computedRightPx = this.getElementRightPx(element, beLazy);
        const notOffscren = (computedUpPx >= 0 && computedLeftPx >= 0);
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const topLeftPixelOnScreen = (computedUpPx <= viewportHeight && computedLeftPx <= viewportWidth);
        const bottomRightPixelOnScreen = (computedDownPx <= viewportHeight && computedRightPx <= viewportWidth);
        let isInViewport = null;

        if (options['checkFullyInViewport']) {
          isInViewport = notOffscren &&
            topLeftPixelOnScreen &&
            bottomRightPixelOnScreen;
        } else {
          isInViewport = notOffscren &&
            topLeftPixelOnScreen ||
            bottomRightPixelOnScreen;
        }

        return isInViewport;
      }

      wrap(element, wrapper) {
        if (element && element.parentNode) {
          element.parentNode.insertBefore(wrapper, element);
          wrapper.appendChild(element);
        }
      }
    }
});

// * ... Galleries Archive
Object.assign(_mauGalleryManager, {
  'GalleriesArchive':
    class GalleriesArchive {
      constructor() {
        this.galleryInstanceIdCount = 0;
        this.archive = [];
      }

      appendGalleryInstance(galleryInstance) {
        this.galleryInstanceIdCount += 1;
        galleryInstance.id = this.galleryInstanceIdCount;
        this.initializeGalleryInstance(galleryInstance);
        this.archive.push(galleryInstance);
      }

      initializeGalleryInstance(galleryInstance) {
        function appendGalleryInstanceCSS(galleryInstance) {
          const style = (() => {
            let style = document.createElement('style');
            style.appendChild(document.createTextNode(''));
            document.head.appendChild(style);
            return style;
          })();

          const optionsStyles = galleryInstance.options('styles');
          function animationStyleProperty(animationCategory, key) {
            return optionsStyles['animation'][animationCategory][key];
          }

          const animationName = animationStyleProperty('gallery', 'animationName');
          const animationKeyframes = animationStyleProperty('gallery', 'animationKeyframes');
          const animationDurationOnFilter = animationStyleProperty('gallery', 'animationDurationOnFilter');
          const animationEasing = animationStyleProperty('gallery', 'animationEasing');
          const animationDurationOnModalAppear = animationStyleProperty('gallery', 'animationDurationOnModalAppear');

          const animationRuleValue = `${animationName} ${animationDurationOnFilter} ${animationEasing}`;
          const modalAnimationRuleValue = `${animationName} ${animationDurationOnModalAppear} ${animationEasing}`;

          const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');

          const rules = {
            'animationKeyframes': `@keyframes ${animationName} ${animationKeyframes}`,
            'galleryAnimation':
              `.${mauPrefixClass}.row {
                animation: ${animationRuleValue}
              }`,
            'modalAnimation':
              `.${mauPrefixClass}.modal {
                animation: ${modalAnimationRuleValue}
              }`,
            'hackInTheMatrix':
              `.${mauPrefixClass}.item-column::after {
                content: "";
                position: relative;
                z-index: -1000;
                display: block;
                padding-bottom: 100%;
              }`,
          };

          if (_mauGalleryManager['Mobile_Instance'].isOnMobile()) {
            const galleryRootNodeId = galleryInstance.options('galleryRootNodeId');
            const mobileRules = {
              'disableFocusOutlineOnGalleryImages':
                `#${galleryRootNodeId} .${mauPrefixClass}.item-column a:focus {
                  outline-style: none;
                  box-shadow: none;
                  border-color: transparent;
                }`
            };
            Object.assign(rules, mobileRules);
          }
          Object.keys(rules).reverse().forEach(key => style.sheet.insertRule(rules[key].replace(/[\s]+/g, ' ').trim(), 0));
        }

        function generateAllRowWrappers(galleryInstance) {
          const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
          const galleryItemClass = _mauGalleryManager.options('galleryItemClass');
          function doGenerateAllRowWrappers(galleryInstance, galleryRootNode) {
            function doGenerateOneRowWrapper(galleryInstance, galleryRootNode, item) {
              function wrapItemInColumn(galleryInstance, element) {
                function generateWrapperChild(isImg, lightBox) {
                  const modalTriggerClass = _mauGalleryManager.options('modalTriggerClass');
                  const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
                  if (isImg && lightBox) {
                    const wrapper_child = document.createElement('a');
                    wrapper_child.href = '#';
                    wrapper_child.classList.add(mauPrefixClass, modalTriggerClass, 'd-flex', 'w-100', 'h-100');
                    wrapper_child.style.display = 'none';
                    wrapper_child.style.textDecoration = 'none';
                    wrapper_child.style.color = 'inherit';
                    return wrapper_child;
                  } else {
                    const wrapper_child = document.createElement('div');
                    wrapper_child.setAttribute('tabindex', '0');
                    wrapper_child.classList.add('w-100', 'h-100');
                    return wrapper_child;
                  }
                }

                function validateColumnsObjSchema(columns) {
                  const columnsObjSchema = { 'xs': '', 'sm': '', 'md': '', 'lg': '', 'xl': '' };
                  Object.keys(columns).forEach(key => {
                    if (!(key in columnsObjSchema)) {
                      throw new Error(`Unknown columns key: ${key}.`);
                    }
                  });
                }

                function generateColumnClasses(columns) {
                  const columnClasses = [];

                  if (columns['xs']) {
                    columnClasses.push(`col-${Math.trunc(12 / columns['xs'])}`);
                  }
                  if (columns['sm']) {
                    columnClasses.push(`col-sm-${Math.trunc(12 / columns['sm'])}`);
                  }
                  if (columns['md']) {
                    columnClasses.push(`col-md-${Math.trunc(12 / columns['md'])}`);
                  }
                  if (columns['lg']) {
                    columnClasses.push(`col-lg-${Math.trunc(12 / columns['lg'])}`);
                  }
                  if (columns['xl']) {
                    columnClasses.push(`col-xl-${Math.trunc(12 / columns['xl'])}`);
                  }
                  return columnClasses;
                }

                const lightBox = galleryInstance.options('lightBox');
                const columns = galleryInstance.options('columns');
                const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
                const isImg = element.tagName === 'IMG' || element.tagName === 'PICTURE';
                let wrapper = null;
                let wrapper_child = null;

                if (typeof columns === 'number') {
                  wrapper = document.createElement('div');
                  wrapper.classList.add(mauPrefixClass, 'item-column', 'position-relative', 'mb-0', 'p-0', `col-${Math.trunc(12 / columns)}`);
                  wrapper_child = generateWrapperChild(isImg, lightBox);
                } else if (typeof columns === 'object') {
                  try {
                    validateColumnsObjSchema(columns);
                  } catch (error) {
                    throw error;
                  }

                  const columnClasses = generateColumnClasses(columns);
                  wrapper = document.createElement('div');
                  wrapper.classList.add(mauPrefixClass, 'item-column', ...columnClasses, 'position-relative', 'mb-0', 'p-0');
                  wrapper_child = generateWrapperChild(isImg, lightBox);
                } else {
                  throw new Error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
                }
                _mauGalleryManager['DOM_Manipulations_Instance'].wrap(element, wrapper_child);
                _mauGalleryManager['DOM_Manipulations_Instance'].wrap(element.parentNode, wrapper);
              }

              let tag = null;
              let itemImg = null;

              // * ... FYI: 'object-fit-cover' class will be supported in Bootstrap 5.3
              if (item.tagName === 'IMG') {
                tag = item.dataset.galleryTag;
                item.classList.add('object-fit-cover', 'position-absolute', 'img-fluid', 'w-100', 'h-100', 'p-2', 'd-block');
                item.setAttribute('data-related-gallery-id', `${galleryInstance.id}`);
              } else if (item.tagName === 'PICTURE') {
                itemImg = item.querySelector('img');
                tag = itemImg.dataset.galleryTag;
                itemImg.classList.add('object-fit-cover', 'position-absolute', 'img-fluid', 'w-100', 'h-100', 'p-2', 'd-block');
                itemImg.setAttribute('data-related-gallery-id', `${galleryInstance.id}`);
              }

              if (galleryInstance.options('showTags') && tag) {
                galleryInstance.tagsSet().add(tag);
              }

              const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
              const parent = galleryRootNode.querySelector(`.${mauPrefixClass}.row`);
              parent.append(item);
              wrapItemInColumn(galleryInstance, item);
            }

            galleryRootNode.querySelectorAll(`.${mauPrefixClass}.${galleryItemClass}`).forEach(item => {
              if (item.parentNode.tagName === 'PICTURE') {
                item = item.parentNode;
              }
              doGenerateOneRowWrapper(galleryInstance, galleryRootNode, item);
            });
          }

          const galleryRootNodeId = galleryInstance.options('galleryRootNodeId');
          const galleryRootNode = document.querySelector(`#${galleryRootNodeId}`);

          if (!galleryRootNode.classList.contains('row')) {
            const div = document.createElement('div');
            div.classList.add(_mauGalleryManager.options('mauPrefixClass'), 'row');
            galleryRootNode.append(div);
          }

          doGenerateAllRowWrappers(galleryInstance, galleryRootNode);
        }

        appendGalleryInstanceCSS(galleryInstance);
        generateAllRowWrappers(galleryInstance);

        const lightBox = galleryInstance.options('lightBox');
        if (lightBox) {
          _mauGalleryManager['Modal_Instance'].createModal(galleryInstance);
        }

        galleryInstance.showItemTags();
        _mauGalleryManager['AtomicGalleryManager_Instance'].generateListeners(galleryInstance);
      }

      getGalleryInstance(galleryInstanceId) {
        const matchingElements = this.archive.filter(({ id }) => id === galleryInstanceId);
        if (matchingElements.length === 0) {
          return null;
        }
        return matchingElements[0];
      }
    }
});

// * ... Camera
Object.assign(_mauGalleryManager, {
  'Camera':
    class Camera {
      constructor() {
        this.dataMemos = {
          'activeElement': null,
          'activeElementAbsoluteY': null,
          'activeElementComputedBottom': null,
          'activeGalleryPicture': null,
          'oldX': 0,
          'oldY': 0,
          'oldYDelta': 0,
          'screenOrientation': null,
          'lockScreenHasGlitched': false
        };
      }

      memos(key = undefined, value = undefined) {
        return _mauGalleryManager.objAccessor(this.dataMemos, key, value);
      }

      moveCamera(x, y) {
        function doMoveCamera(x, y, latency) {
          setTimeout(() => {
            window.scrollTo({
              top: y,
              left: x,
              behavior: 'smooth'
            });
          }, latency);
        }

        const invalidTargetPos = x < 0;
        if (invalidTargetPos) {
          return;
        }
        const latencyToCounterpartScrollSmoothBehavior = 25;
        doMoveCamera(x, y, latencyToCounterpartScrollSmoothBehavior);
      }

      saveCurrentCameraPosition() {
        function saveCurrentActiveElement(me) {
          const activeElement = document.activeElement;
          if (activeElement) {
            me.memos('activeElement', activeElement);
            me.memos('activeElementAbsoluteY', _mauGalleryManager['DOM_Manipulations_Instance'].getAbsoluteElementY(activeElement));
            me.memos('activeElementComputedBottom', _mauGalleryManager['DOM_Manipulations_Instance'].getElementBottomPx(activeElement));
          } else {
            me.memos('activeElement', null);
            me.memos('activeElementAbsoluteY', null);
            me.memos('activeElementComputedBottom', null);
          }
        }

        this.memos('oldX', window.scrollX);
        this.memos('oldY', window.scrollY);
        saveCurrentActiveElement(this);
      }

      moveCameraToSavedPosition(rawMove = false) {
        function processRawMove(me) {
          me.moveCamera(me.memos('oldX'), me.memos('oldY'));
        }

        function hotfix(me, activeElement) {
          me.moveCamera(me.memos('oldX'), me.memos('oldY'));
          me.memos('lockScreenHasGlitched', false);
          if (activeElement) {
            activeElement.focus({ preventScroll: true });
          }
        }

        function scrollToActiveElement(activeElement) {
          const DOM_Manipulations_Instance = _mauGalleryManager['DOM_Manipulations_Instance'];
          const computedBottomPx = DOM_Manipulations_Instance.getElementBottomPx(activeElement);
          const beLazy = true;
          const computedTopPx = DOM_Manipulations_Instance.getElementTopPx(activeElement, beLazy);
          const navbarElement = document.querySelector('.navbar');
          const navbarIsInViewport = DOM_Manipulations_Instance.isInViewport(navbarElement);
          const navbarOffset = navbarIsInViewport ? DOM_Manipulations_Instance.getElementHeight(navbarElement) * 1.10 : 0;
          const elementIsUpper = computedBottomPx < navbarOffset;
          const elementIsBelow = computedTopPx >= window.innerHeight;

          if (elementIsUpper) {
            activeElement.focus({ preventScroll: false });
            return true;
          } else if (elementIsBelow) {
            activeElement.scrollIntoView(true);
            activeElement.focus({ preventScroll: true });
            return true;
          } else {
            activeElement.focus({ preventScroll: true });
          }
          return false;
        }

        if (rawMove) {
          processRawMove(this);
          return;
        }

        const activeGalleryPicture = this.memos('activeGalleryPicture');
        const activeElement = this.memos('activeElement');
        const lockscreenGlitchCtx = this.memos('lockScreenHasGlitched') && window.scrollY + this.memos('oldYDelta') === this.memos('oldY');
        let scrolled = false;
        if (activeGalleryPicture) {
          scrolled = scrollToActiveElement(activeGalleryPicture);
        } else if (activeElement) {
          scrolled = scrollToActiveElement(activeElement);
        }
        if (lockscreenGlitchCtx && !scrolled) {
          activeGalleryPicture ? hotfix(this, activeGalleryPicture) : hotfix(this, activeElement);
        }
      }
    }
});

// * ... Atomic Gallery Manager
Object.assign(_mauGalleryManager, {
  'AtomicGalleryManager':
    class AtomicGalleryManager {
      constructor() { }

      filterByTag(relatedGalleryInstance, element) {
        function process(element) {
          function handleCameraSideEffectsOnTagsPositionSettedToTop(relatedGalleryInstance) {
            if (relatedGalleryInstance.options('tagsPosition') === 'top') {
              const rawMove = true;
              _mauGalleryManager['Camera_Instance'].moveCameraToSavedPosition(rawMove);
            }
          }

          function handleCameraSideEffectsOnTagsPositionSettedToBottom(relatedGalleryInstance, element) {
            if (relatedGalleryInstance.options('tagsPosition') === 'bottom') {
              element.scrollIntoView(false);
            }
          }

          function forceReplayAnim(relatedGalleryInstance) {
            const galleryRootNodeId = relatedGalleryInstance.options('galleryRootNodeId');
            const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
            const rootNode = document.querySelector(`#${galleryRootNodeId} .${mauPrefixClass}.row`);

            if (!_mauGalleryManager['Mobile_Instance'].isOnMobile()) {
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

          function updateGalleryComponent(relatedGalleryInstance, element) {
            const galleryRootNodeId = relatedGalleryInstance.options('galleryRootNodeId');
            const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
            const isNotLazy = false;
            const richGalleryItems = relatedGalleryInstance.getRichGalleryItems(isNotLazy);
            const filtersActiveTagClass = relatedGalleryInstance.options('filtersActiveTagClass');
            const activeTag = document.querySelector(`#${galleryRootNodeId} .${mauPrefixClass}.${filtersActiveTagClass}`);
            const newTag = element.dataset.imagesToggle;

            activeTag.classList.remove(filtersActiveTagClass, 'active');
            element.classList.add(mauPrefixClass, filtersActiveTagClass, 'active');
            richGalleryItems.forEach(richItem => {
              if (newTag === 'all' || richItem.item.dataset.galleryTag === newTag) {
                richItem.column.style.display = null;
              } else {
                richItem.column.style.display = 'none';
              }

              handleCameraSideEffectsOnTagsPositionSettedToTop(relatedGalleryInstance);
              handleCameraSideEffectsOnTagsPositionSettedToBottom(relatedGalleryInstance, element);
            });
            return newTag;
          }

          _mauGalleryManager['Camera_Instance'].saveCurrentCameraPosition();
          forceReplayAnim(relatedGalleryInstance);
          const newTag = updateGalleryComponent(relatedGalleryInstance, element);
          relatedGalleryInstance.memos('currentTag', newTag);
        }

        if (element.classList.contains(relatedGalleryInstance.options('filtersActiveTagClass'))) {
          return;
        }
        process(element);
      }

      generateListeners(relatedGalleryInstance) {
        const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
        const galleryRootNodeId = relatedGalleryInstance.options('galleryRootNodeId');
        const gallery = document.querySelector(`#${galleryRootNodeId}`);
        const galleryElementNavLinks = gallery.querySelectorAll(`#${galleryRootNodeId} .tags-bar .${mauPrefixClass}.nav-link`);
        const relatedGalleryInstanceId = relatedGalleryInstance.id;

        galleryElementNavLinks.forEach(navlink => navlink.addEventListener('click', event => _mauGalleryManager['AtomicGalleryManager_Instance'].filterByTag(relatedGalleryInstance, event.target)));
        if (!relatedGalleryInstance.options('lightBox')) {
          return;
        }

        const modalTriggerClass = _mauGalleryManager.options('modalTriggerClass');
        const relatedGalleryInstanceModalTriggerElements = gallery.querySelectorAll(`#${galleryRootNodeId} .${mauPrefixClass}.${modalTriggerClass}`);

        relatedGalleryInstanceModalTriggerElements.forEach(element => {
          element.addEventListener('click', event => {
            event.preventDefault();
            const modalInstance = _mauGalleryManager['Modal_Instance'];
            let imgElement = event.target.querySelector('img') ?? event.target;

            if (relatedGalleryInstance.options('lightBox') && imgElement) {
              if (imgElement.parentNode.tagName === 'PICTURE') {
                imgElement = imgElement.parentNode;
              }
              let targetAnchor = event.target;
              while (targetAnchor.tagName !== "A" && !targetAnchor.classList.contains(_mauGalleryManager.options('modalTriggerClass'))) {
                targetAnchor = targetAnchor.parentNode;
              }
              _mauGalleryManager['Camera_Instance'].memos('activeGalleryPicture', targetAnchor);
              modalInstance.modalOnOpen(imgElement, relatedGalleryInstance);
            }
          });
        });
      }
    }
});

// * ... CSS injections
Object.assign(_mauGalleryManager, {
  'appendGlobalCSS': () => {
    const style = (() => {
      let style = document.createElement('style');
      style.appendChild(document.createTextNode(''));
      document.head.appendChild(style);
      return style;
    })();

    const optionsStyles = _mauGalleryManager.options('styles');
    function animationStyleProperty(animationCategory, key) {
      return optionsStyles['animation'][animationCategory][key];
    }

    const arrowTransitionDelay = animationStyleProperty('modal', 'arrowTransitionDelay');

    const modalNavigation = optionsStyles['modal']['navigation'];
    const modalArrowBoxesSize = modalNavigation['arrowBoxesSizeObj']['size'];
    const modalArrowBoxesSizeUnit = modalNavigation['arrowBoxesSizeObj']['unit'];
    const modalArrowBoxesSizeHalf = Math.trunc(modalArrowBoxesSize / 2);

    const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
    const lightboxId = _mauGalleryManager.options('lightboxId');
    const modalArrowSizeRuleValue = modalArrowBoxesSize + modalArrowBoxesSizeUnit;
    const modalArrowHalfSizeRuleValue = modalArrowBoxesSizeHalf + modalArrowBoxesSizeUnit;

    const rules = {
      'secureModalBackdropSize':
        `.modal-backdrop {
          width: 400vw !important;
          height: 400vh !important;
        }`,
      'killModalCarouselAnimations':
        `.${mauPrefixClass}.carousel-item {
          transition: all 0s !important;
        }`,
      'navigationButtons':
        `.${mauPrefixClass}.mg-next, .${mauPrefixClass}.mg-prev {
          --_nav-btns-delta: calc(${modalArrowSizeRuleValue} * .2);
          position: absolute;
          bottom: calc(50% - ${modalArrowHalfSizeRuleValue});
          width: ${modalArrowSizeRuleValue};
          height: ${modalArrowSizeRuleValue};
          border-radius: 0;
          transition: left ${arrowTransitionDelay}, right ${arrowTransitionDelay};
        }`,
      'navigationButtonRight':
        `.${mauPrefixClass}.mg-next {
          --_negative-value: -${modalArrowSizeRuleValue};
          --_right: calc(var(--_negative-value) - var(--_nav-btns-delta));
          right: var(--_right)
        }`,
      'navigationButtonLeft':
        `.${mauPrefixClass}.mg-prev {
          --_negative-value: -${modalArrowSizeRuleValue};
          --_left: calc(var(--_negative-value) - var(--_nav-btns-delta));
          left: var(--_left);
        }`,
      'disableBootstrapCarouselControlClickableAreaOnModal':
        `#${lightboxId} .carousel-control-prev, #${lightboxId} .carousel-control-next {
          width: 0;
        }`,
      'navigationButtonsResponsive':
        `@media (max-width: 1000px) {
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
    Object.keys(rules).reverse().forEach(key => style.sheet.insertRule(rules[key].replace(/[\s]+/g, ' ').trim(), 0));
  }
});

// * ... Instances
Object.assign(_mauGalleryManager, {
  'Mobile_Instance': new _mauGalleryManager['Mobile'],
  'DOM_Manipulations_Instance': new _mauGalleryManager['DOM_Manipulations'],
  'GalleriesArchive_Instance': new _mauGalleryManager['GalleriesArchive'],
  'Cache_Instance': new _mauGalleryManager['Cache'],
  'Modal_Instance': new _mauGalleryManager['Modal'],
  'Camera_Instance': new _mauGalleryManager['Camera'],
  'AtomicGalleryManager_Instance': new _mauGalleryManager['AtomicGalleryManager']
});

// * ... MauGallery Core
Object.assign(_mauGalleryManager, {
  'MauGallery':
    class MauGallery {
      constructor(opt = {}) {
        const mauGallerydefaults = {
          'columns': 3,
          'lightBox': true,
          'showTags': true,
          'navigation': true,
          'tagsPosition': 'top',
          'galleryRootNodeId': 'maugallery',
          'filtersActiveTagClass': 'active-tag',
          'styles': {
            'animation': {
              'gallery': {
                'animationName': 'mauGalleryFadeInDefaultAnimationName',
                'animationKeyframes': '{0% {opacity: 0} 5% {opacity: 0} 100% {opacity: 1}}',
                'animationDurationOnFilter': '.5s',
                'animationDurationOnModalAppear': '.25s',
                'animationEasing': 'ease-in'
              },
            },
          }
        };

        this.props = {
          'memos': {
            'richGalleryItems': null,
            'currentTag': null
          },
          'options': mauGallerydefaults,
          'tagsSet': new Set()
        };

        function assignAndLockObjs(mauProps) {
          Object.seal(mauProps);
          Object.seal(mauProps['memos']);
          Object.assign(mauProps['options'], opt);
          if (!mauProps.options['mutableOptions']) {
            Object.freeze(mauProps['options']);
          }
        }
        assignAndLockObjs(this.props);
        _mauGalleryManager['GalleriesArchive_Instance'].appendGalleryInstance(this);
      }

      memos(key = undefined, value = undefined) {
        return _mauGalleryManager.objAccessor(this.props['memos'], key, value);
      }

      options(key = undefined, value = undefined) {
        return _mauGalleryManager.objAccessor(this.props['options'], key, value);
      }

      tagsSet() {
        return this.props['tagsSet'];
      }

      getRichGalleryItems(lazy = true) {
        if (lazy && this.memos('richGalleryItems')) {
          return this.memos('richGalleryItems');
        }

        const galleryRootNodeId = this.options('galleryRootNodeId');
        const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
        const galleryItemClass = _mauGalleryManager.options('galleryItemClass');
        const columns = document.querySelectorAll(`#${galleryRootNodeId} div.${mauPrefixClass}.item-column`);
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
        this.memos('richGalleryItems', dataEntries);
        return dataEntries;
      }

      showItemTags() {
        if (!this.options('showTags')) {
          return;
        }

        const galleryRootNodeId = this.options('galleryRootNodeId');
        const galleryRootNode = document.querySelector(`#${galleryRootNodeId}`);
        const tagsPosition = this.options('tagsPosition');
        const activeTagClass = this.options('filtersActiveTagClass');
        const disableFiltersButtonLabel = _mauGalleryManager.options('disableFiltersButtonLabel');
        const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
        let tagItems = `<li class="nav-item"><button style="touch-action:manipulation;" class="${mauPrefixClass} nav-link active ${activeTagClass}" data-images-toggle="all">${disableFiltersButtonLabel}</button></li>`;
        this.tagsSet().forEach(value => tagItems += `<li class="nav-item"><button style="touch-action:manipulation;" class="${mauPrefixClass} nav-link" data-images-toggle="${value}">${value}</button></li>`);
        const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

        if (tagsPosition === 'bottom') {
          galleryRootNode.innerHTML = galleryRootNode.innerHTML + tagsRow;
        } else if (tagsPosition === 'top') {
          galleryRootNode.innerHTML = tagsRow + galleryRootNode.innerHTML;
        } else {
          throw new Error(`Unknown tags position: ${tagsPosition}`);
        }
      }
    }
});

// * ... Placeholders handling
Object.assign(_mauGalleryManager, {
  'removePlaceholders': () => {
    const mauPrefixClass = _mauGalleryManager.options('mauPrefixClass');
    const galleryPlaceHolderClass = _mauGalleryManager.options('galleryPlaceHolderClass');
    const placeholders = document.querySelectorAll(`.${mauPrefixClass}.${galleryPlaceHolderClass}`);
    placeholders.forEach(element => element.remove());
  }
});

_mauGalleryManager.removePlaceholders();
_mauGalleryManager.appendGlobalCSS();
