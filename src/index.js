import Notiflix from 'notiflix';
import { ImgAPI } from './ImgAPI';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const imgAPI = new ImgAPI();

let currentPage = 1;
let allImagesLoaded = false;
let newImg = null;

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.searchForm.addEventListener('submit', onSearchImg);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

refs.loadMoreBtn.classList.add('is-hidden');

async function onSearchImg(e) {
  e.preventDefault();

  const data = new FormData(e.target);
  const query = data.get('searchQuery').trim();

  if (query === '') {
    Notiflix.Notify.warning('Please enter a search query!');
    return;
  }

  currentPage = 1;
  allImagesLoaded = false;

  refs.gallery.innerHTML = '';
  refs.loadMoreBtn.classList.add('is-hidden');

  const perPage = 40;
  try {
    newImg = await imgAPI.searchImgByAxios(query, currentPage, perPage);
    if (newImg.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    Notiflix.Notify.success(`Hooray! We found ${newImg.totalHits} images.`);

    refs.gallery.innerHTML = '';

    renderImg(newImg.hits);

    refs.loadMoreBtn.classList.remove('is-hidden');

    if (newImg.totalHits <= perPage) {
      refs.loadMoreBtn.classList.add('is-hidden');
      allImagesLoaded = true;
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      refs.loadMoreBtn.classList.remove('is-hidden');
      allImagesLoaded = false;
    }
  } catch (error) {
    Notiflix.Notify.failure(
      'Oops, something went wrong. Please try again later.'
    );
    console.log(error);
  }

  e.target.reset();
}

async function onLoadMore() {
  const query = document.querySelector('input').value.trim();
  const currentImages = document.querySelectorAll('.photo-card').length;

  if (allImagesLoaded) {
    Notiflix.Notify.warning(
      "We're sorry, but there are no more images to load."
    );
    return;
  }

  if (currentPage === Math.ceil(newImg.totalHits / 40)) {
    refs.loadMoreBtn.classList.add('is-hidden');
    allImagesLoaded = true;
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
    return;
  }

  currentPage += 1;

  try {
    const response = await imgAPI.searchImgByAxios(query, currentPage, 40);
    newImg.hits.push(...response.hits);
    renderImg(response.hits);

    if (refs.gallery.children.length >= newImg.totalHits) {
      refs.loadMoreBtn.classList.add('is-hidden');
      allImagesLoaded = true;
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    Notiflix.Notify.failure(
      'Oops, something went wrong. Please try again later.'
    );
    console.log(error);
  }
}

function imgTemplate({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
    <a class="gallery-item" href="${largeImageURL}">
      <div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes:<br></b> ${likes}
          </p>
          <p class="info-item">
            <b>Views:<br></b> ${views}
          </p>
          <p class="info-item">
            <b>Comments:<br></b> ${comments}
          </p>
          <p class="info-item">
            <b>Downloads:<br></b> ${downloads}
          </p>
        </div>
      </div>
      </a>
    `;
}

function renderImg(img) {
  const markup = img.map(imgTemplate).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}
