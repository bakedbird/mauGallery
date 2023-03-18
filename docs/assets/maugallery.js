function mauGallery(opt = {}) {
  const mauGallerydefaults = {
    columns: 3,
    lightBox: true,
    lightboxId: 'mauDefaultLightboxId',
    galleryRootNodeId: 'maugallery',
    galleryItemsRowId: 'gallery-items-row',
    filtersActiveTagId: 'active-tag',
    lightboxImgId: 'lightboxImage',
    galleryItemClass: 'gallery-item',
    mauPrefixClass: 'mau',
    showTags: true,
    tagsPosition: 'bottom',
    navigation: true,
    prevImgButtonLabel: 'Previous image',
    nextImgButtonLabel: 'Next image',
    disableFiltersButtonLabel: 'All'
  };
  let memoCurX = 0;
  let memoCurY = 0;
  let memoScrollBehavior = null;
  let memoIsOnMobile = null;
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

    function snapCameraToSavedPosition(delay = 2) {
      snapCamera(memoCurX, memoCurY, delay);
      clearSaveCurrentCameraPositionSideEffects();
    }

    function wrapItemInColumn(element, options) {
      const style = (() => {
        let style = document.createElement('style');
        style.appendChild(document.createTextNode(''));
        document.head.appendChild(style);
        return style;
      })();

      function doWrap(element, wrapperOpen, wrapperClose, options) {
        orgHtml = element.outerHTML;
        newHtml = wrapperOpen + orgHtml + wrapperClose;
        element.outerHTML = newHtml;
      }

      const columns = options.columns;
      const mauPrefixClass = options.mauPrefixClass;
      const isImg = element.tagName === 'IMG';
      const injectModalTrigger = isImg ? `data-bs-toggle="modal" data-bs-target=".${options.mauPrefixClass}#${options.lightboxId}"` : '';
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
        doWrap(element, wrapperOpen, wrapperClose, options);
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
        doWrap(element, wrapperOpen, wrapperClose, options);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    }

    function prevImage(options) {
      const filtersActiveTagId = options.filtersActiveTagId;
      const lightboxImgId = options.lightboxImgId;
      const galleryItemClass = options.galleryItemClass;
      const mauPrefixClass = options.mauPrefixClass;
      const galleryItems = document.querySelectorAll(`img.${mauPrefixClass}.${galleryItemClass}`);
      const lightboxImgSrc = document.querySelector(`.${mauPrefixClass}#${lightboxImgId}`).getAttribute('src');
      const activeTag = document.querySelector(`.${mauPrefixClass}#${filtersActiveTagId}`).dataset.imagesToggle;
      let activeImage = null;
      let imagesCollection = [];

      for (const item of galleryItems) {
        if (item.getAttribute('src') === lightboxImgSrc) {
          activeImage = item;
          break;
        }
      }

      if (activeTag === 'all') {
        imagesCollection = galleryItems;
      } else {
        galleryItems.forEach(item => {
          if (item.dataset.galleryTag === activeTag) {
            imagesCollection.push(item);
          }
        });
      }
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

      document.querySelector(`.${mauPrefixClass}#${lightboxImgId}`).setAttribute('src', prev.getAttribute('src'));
    }

    function nextImage(options) {
      const filtersActiveTagId = options.filtersActiveTagId;
      const lightboxImgId = options.lightboxImgId;
      const galleryItemClass = options.galleryItemClass;
      const mauPrefixClass = options.mauPrefixClass;
      const galleryItems = document.querySelectorAll(`img.${mauPrefixClass}.${galleryItemClass}`);
      const lightboxImgSrc = document.querySelector(`.${mauPrefixClass}#${lightboxImgId}`).getAttribute('src');
      const activeTag = document.querySelector(`.${mauPrefixClass}#${filtersActiveTagId}`).dataset.imagesToggle;
      let activeImage = null;
      let imagesCollection = [];

      for (const item of galleryItems) {
        if (item.getAttribute('src') === lightboxImgSrc) {
          activeImage = item;
          break;
        }
      }

      if (activeTag === 'all') {
        imagesCollection = galleryItems;
      } else {
        galleryItems.forEach(item => {
          if (item.dataset.galleryTag === activeTag) {
            imagesCollection.push(item);
          }
        });
      }

      let index = 0;
      for (const image of imagesCollection) {
        index += 1;
        if (activeImage.getAttribute('src') === image.getAttribute('src')) {
          break;
        }
      }

      const next = imagesCollection[index] ?? imagesCollection[0];
      document.querySelector(`.${mauPrefixClass}#${lightboxImgId}`).setAttribute('src', next.getAttribute('src'));
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
      const galleryItems = document.querySelectorAll(`#${options.galleryRootNodeId} .${options.mauPrefixClass}.${options.galleryItemClass}`);
      const activeTag = document.querySelector(`.${options.mauPrefixClass}#${options.filtersActiveTagId}`);
      const tag = element.dataset.imagesToggle;

      activeTag.classList.remove('active');
      activeTag.removeAttribute('id');
      element.classList.add(options.mauPrefixClass, 'active');
      element.id = options.filtersActiveTagId;

      galleryItems.forEach(item => {
        if (tag === 'all' || item.dataset.galleryTag === tag) {
          item.parentNode.parentNode.style.display = 'block';
        } else {
          item.parentNode.parentNode.style.display = 'none';
        }
        snapCameraToSavedPosition(delay = 3);
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
      if (item.tagName === 'IMG') {
        item.classList.add('img-fluid');
      }

      const parent = target.querySelector(`.${options.mauPrefixClass}#${options.galleryItemsRowId}`);
      parent.append(item);

      wrapItemInColumn(item, options);
      const tag = item.dataset.galleryTag;
      if (options.showTags && tag !== undefined) {
        tagsSet.add(tag);
      }
    }

    function generateListeners(gallery, modal, options) {
      function handleKeyDown(event) {
        if (event.keyCode == 37 || event.key === 'ArrowLeft') {
          prevImage(options);
        }
        if (event.keyCode == 39 || event.key === 'ArrowRight') {
          nextImage(options);
        }
      }

      elements = gallery.querySelectorAll(`.${options.mauPrefixClass}.${options.galleryItemClass}`);
      elements.forEach(element => element.parentNode.addEventListener('click', () => {
        if (options.lightBox && element.tagName === 'IMG') {
          lightBoxOnOpen(modal, element, options);
        }
      }));

      const galleryElementNavLinks = gallery.querySelectorAll(`.${options.mauPrefixClass}.nav-link`);
      const galleryElementMgPrev = gallery.querySelector(`#${options.galleryRootNodeId} .${options.mauPrefixClass}.mg-prev`);
      const galleryElementMgNext = gallery.querySelector(`#${options.galleryRootNodeId} .${options.mauPrefixClass}.mg-next`);

      galleryElementNavLinks.forEach(navlink => navlink.addEventListener('click', (event) => filterByTag(event.target, options)));
      galleryElementMgPrev.addEventListener('click', () => prevImage(options));
      galleryElementMgNext.addEventListener('click', () => nextImage(options));

      modal.addEventListener('shown.bs.modal', () => {
        saveCurrentCameraPosition();
        document.addEventListener('keydown', handleKeyDown);
      });

      modal.addEventListener('hidden.bs.modal', () => {
        if (options.navigation) {
          const buttons = modal.querySelectorAll('button');
          buttons.forEach(button => button.removeAttribute('tabindex'));
        }
        snapCameraToSavedPosition();
        document.removeEventListener('keydown', handleKeyDown);
      });
    }

    function lightBoxOnOpen(modal, element, options) {
      const e = document.querySelector(`.${options.mauPrefixClass}#${options.lightboxId}`);
      const img = e.querySelector(`.${options.mauPrefixClass}#${options.lightboxImgId}`);
      img.setAttribute('src', element.getAttribute('src'));
      if (options.navigation) {
        const buttons = modal.querySelectorAll('button');
        buttons.forEach(button => button.setAttribute('tabindex', 0));
      }
    }

    function createLightBox(gallery, options) {
      const lightboxImgId = options.lightboxImgId;
      const lightboxId = options.lightboxId;
      const navigation = options.navigation;
      const prevImgBtnLabel = options.prevImgButtonLabel;
      const nextImgBtnLabel = options.nextImgButtonLabel;
      const mauPrefixClass = options.mauPrefixClass;

      const lightbox = `
        <div class="${mauPrefixClass} modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true" style="user-select:none;-webkit-user-select:none;">
          <div class="${mauPrefixClass} modal-dialog" role="document">
            <div class="${mauPrefixClass} modal-content">
              <div class="${mauPrefixClass} modal-body">
                <img id="${lightboxImgId}" style="user-select:none;-webkit-user-select:none;" class="${mauPrefixClass} img-fluid" alt="" />
                ${navigation ? `<button aria-label="${prevImgBtnLabel}" class="${mauPrefixClass} mg-prev" style="touch-action:manipulation;border:none;cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><span><</span></button>` : '<span style="display:none;" />'}
                ${navigation ? `<button aria-label="${nextImgBtnLabel}" class="${mauPrefixClass} mg-next" style="touch-action:manipulation;border:none;cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}"><span>></span></button>` : '<span style="display:none;" />'}
              </div>
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

    function process(target, options) {
      createRowWrapper(target, options);
      if (options.lightBox) {
        createLightBox(target, options);
      }

      target.querySelectorAll(`.${options.mauPrefixClass}.${options.galleryItemClass}`).forEach(
        item => generateRowWrapper(target, item, options, tagsSet)
      );

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