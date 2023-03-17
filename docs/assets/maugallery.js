function mauGallery(opt = {}) {
  const mauGallerydefaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    galleryRootNodeId: 'maugallery',
    galleryItemsRowId: 'gallery-items-row',
    filtersActiveTagId: 'active-tag',
    lightboxImgId: 'lightboxImage',
    galleryItemClass: 'gallery-item',
    showTags: true,
    tagsPosition: 'bottom',
    navigation: true,
    prevImgButtonLabel: 'Previous image',
    nextImgButtonLabel: 'Next image',
    disableFiltersButtonLabel: 'All'
  };
  let memoCurX = 0;
  let memoCurY = 0;
  const tagsSet = new Set();

  function injectMau(target, options) {
    function prevImage(filtersActiveTagId, lightboxImgId, galleryItemClass) {
      let activeImage = null;
      let imagesCollection = [];
      const galleryItems = document.querySelectorAll(`img.${galleryItemClass}`);
      const lightboxImgSrc = document.querySelector(`#${lightboxImgId}`).getAttribute('src');
      const activeTag = document.querySelector(`#${filtersActiveTagId}`).dataset.imagesToggle;

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

      document.querySelector(`#${lightboxImgId}`).setAttribute('src', prev.getAttribute('src'));
    }

    function nextImage(filtersActiveTagId, lightboxImgId, galleryItemClass) {
      let activeImage = null;
      let imagesCollection = [];
      const galleryItems = document.querySelectorAll(`img.${galleryItemClass}`);
      const lightboxImgSrc = document.querySelector(`#${lightboxImgId}`).getAttribute('src');
      const activeTag = document.querySelector(`#${filtersActiveTagId}`).dataset.imagesToggle;

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
      document.querySelector(`#${lightboxImgId}`).setAttribute('src', next.getAttribute('src'));
    }

    function filterByTag(element, options) {
      function forceRedraw(galleryItemsRowId) {
        const rootNode = document.querySelector(`#${galleryItemsRowId}`);
        rootNode.style.animation = 'none';
        rootNode.style.display = 'none';
        rootNode.offsetHeight;
        rootNode.style.display = null;
        rootNode.style.animation = null;
        rootNode.style.animationName = 'none';
        requestAnimationFrame(() => {
          rootNode.style.animationName = null;
        });
      }
      if (element.id === options.filtersActiveTagId) {
        return;
      }
      forceRedraw(options.galleryItemsRowId);
      const galleryItems = document.querySelectorAll(`#${options.galleryRootNodeId} .${options.galleryItemClass}`);
      const activeTag = document.querySelector(`#${options.filtersActiveTagId}`);
      const tag = element.dataset.imagesToggle;

      activeTag.classList.remove('active');
      activeTag.removeAttribute('id');
      element.classList.add('active');
      element.id = options.filtersActiveTagId;

      galleryItems.forEach(item => {
        if (tag === 'all' || item.dataset.galleryTag === tag) {
          item.parentNode.parentNode.style.display = 'block';
        } else {
          item.parentNode.parentNode.style.display = 'none';
        }
      });
    }

    function showItemTags(gallery, options, tagsSet) {
      const tagsPosition = options.tagsPosition;
      const activeTagId = options.filtersActiveTagId;
      const disableFiltersButtonLabel = options.disableFiltersButtonLabel;
      let tagItems =
        `<li class="nav-item"><button class="mau nav-link active" data-images-toggle="all" id="${activeTagId}">${disableFiltersButtonLabel}</span></li>`;
      tagsSet.forEach(value => {
        tagItems += `<li class="nav-item">
                <button class="mau nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });

      const tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;
      if (tagsPosition === 'bottom') {
        gallery.innerHTML = gallery.innerHTML + tagsRow;
      } else if (tagsPosition === 'top') {
        gallery.innerHTML = tagsRow + gallery.innerHTML;
      } else {
        console.error(`Unknown tags position: ${tagsPosition}`);
      }
    }

    function wrapItemInColumn(element, options) {
      function doWrap(element, wrapperOpen, wrapperClose, options) {
        orgHtml = element.outerHTML;
        newHtml = wrapperOpen + orgHtml + wrapperClose;
        element.outerHTML = newHtml;
      }

      const columns = options.columns;
      const isImg = element.tagName === 'IMG';
      const injectModalTrigger = isImg ? `data-bs-toggle="modal" data-bs-target="#${options.lightboxId}"` : ''; 
      let wrapperOpen = '';
      let wrapperClose = '';
      if (typeof columns === 'number') {
        if (isImg) {
          wrapperOpen = `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'><a href="#" ${injectModalTrigger} style="text-decoration:none;color:inherit;display:flex;width:100%;height:100%">`;
          wrapperClose = '</a></div>';
        } else {
          wrapperOpen = `<div tabindex="0" class='item-column mb-4 col-${Math.ceil(12 / columns)}'><div style="width:100%;height:100%;">`;
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
          wrapperOpen = `<div class='item-column mb-4${columnClasses}'><a href="#" ${injectModalTrigger} style="text-decoration:none;color:inherit;display:flex;width:100%;height:100%">`;
          wrapperClose = '</a></div>';
        } else {
          wrapperOpen = `<div tabindex="0" class='item-column mb-4${columnClasses}'><div style="width:100%;height:100%;">`;
          wrapperClose = '</div></div>';
        }
        doWrap(element, wrapperOpen, wrapperClose, options);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
      }
    }

    function generateRowWrapper(target, item, options, tagsSet) {
      if (item.tagName === 'IMG') {
        item.classList.add('img-fluid');
      }

      const parent = target.querySelector(`#${options.galleryItemsRowId}`);
      parent.append(item);

      wrapItemInColumn(item, options);
      const tag = item.dataset.galleryTag;
      if (options.showTags && tag !== undefined) {
        tagsSet.add(tag);
      }
    }

    function generateListeners(gallery, options) {
      function handleKeyDown(event) {
        if (event.keyCode == 37 || event.key === "ArrowLeft") {
          prevImage(options.filtersActiveTagId, options.lightboxImgId, options.galleryItemClass);
        }
        if (event.keyCode == 39 || event.key === "ArrowRight") {
          nextImage(options.filtersActiveTagId, options.lightboxImgId, options.galleryItemClass);
        }
      }
      elements = gallery.querySelectorAll(`.${options.galleryItemClass}`);
      elements.forEach(element => element.parentNode.addEventListener('click', (event) => {
        event.preventDefault();
        if (options.lightBox && element.tagName === 'IMG') {
          lightBoxOnOpen(element, options.lightboxId, options.lightboxImgId);
        }
      }));

      const galleryElementNavLinks = gallery.querySelectorAll('.nav-link');
      const galleryElementMgPrev = gallery.querySelector(`#${options.galleryRootNodeId} .mg-prev`);
      const galleryElementMgNext = gallery.querySelector(`#${options.galleryRootNodeId} .mg-next`);

      galleryElementNavLinks.forEach(navlink => {
        navlink.addEventListener('click', (event) => {
          event.preventDefault();
          filterByTag(event.target, options);
        });
      });
      galleryElementMgPrev.addEventListener('click', () => prevImage(options.filtersActiveTagId, options.lightboxImgId, options.galleryItemClass));
      galleryElementMgNext.addEventListener('click', () => nextImage(options.filtersActiveTagId, options.lightboxImgId, options.galleryItemClass));

      const modal = document.querySelector(`#${options.lightboxId}`);
      modal.addEventListener('shown.bs.modal', () => {
        memoCurX = window.scrollX;
        memoCurY = window.scrollY;
        if (options.navigation) {
          const buttons = modal.querySelectorAll('button');
          let index = 1;
          for (const button of buttons) {
            button.setAttribute('tabindex', index);
            index += 1;
          }
        }
        document.addEventListener('keydown', handleKeyDown);
      });

      modal.addEventListener('hidden.bs.modal', () => {
        if (options.navigation) {
          const buttons = modal.querySelectorAll('button');
          for (const button of buttons) {
            button.removeAttribute('tabindex');
          }
        }
        document.removeEventListener('keydown', handleKeyDown);
        setTimeout(() => {
          const oldScrollBehavior = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = 'auto !important;'
          window.scrollTo({
            top: memoCurY,
            left: memoCurX,
            behavior: 'auto'
          });
          document.documentElement.style.scrollBehavior = oldScrollBehavior;
        }, 1);
      });
    }

    function lightBoxOnOpen(element, lightboxId, lightboxImgId) {
      const e = document.querySelector(`#${lightboxId}`);
      const img = e.querySelector(`#${lightboxImgId}`);
      img.setAttribute('src', element.getAttribute('src'));
    }

    function createLightBox(gallery, options) {
      const lightboxImgId = options.lightboxImgId;
      const lightboxId = options.lightboxId;
      const navigation = options.navigation;
      const prevImgBtnLabel = options.prevImgButtonLabel;
      const nextImgBtnLabel = options.nextImgButtonLabel;
  
      const lightbox = `
        <div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                <img id="${lightboxImgId}" style="user-select:none;-webkit-user-select:none;" class="img-fluid" alt="" />
                ${navigation ? `<button aria-label="${prevImgBtnLabel}" class="mg-prev" style="border:none;cursor:pointer;position:absolute;top:50%;left:-15px;background:white;user-select:none;-webkit-user-select:none;"><span><</span></button>` : '<span style="display:none;" />'}
                ${navigation ? `<button aria-label="${nextImgBtnLabel}" class="mg-next" style="border:none;cursor:pointer;position:absolute;top:50%;right:-15px;background:white;user-select:none;-webkit-user-select:none;}"><span>></span></button>` : '<span style="display:none;" />'}
              </div>
            </div>
          </div>
        </div>`;
      gallery.innerHTML = gallery.innerHTML + lightbox;
    }

    function createRowWrapper(element) {
      if (!element.classList.contains('row')) {
        const div = document.createElement('div');
        div.id = options.galleryItemsRowId;
        div.classList.add('row');
        element.append(div);
      }
    }

    function process(target, options) {
      createRowWrapper(target);
      if (options.lightBox) {
        createLightBox(target, options);
      }

      target.querySelectorAll(`.${options.galleryItemClass}`).forEach(
        item => generateRowWrapper(target, item, options, tagsSet)
      );

      if (options.showTags) {
        showItemTags(target, options, tagsSet);
      }
      generateListeners(target, options);
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