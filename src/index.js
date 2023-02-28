import Notiflix from 'notiflix';
import { ImgAPI } from './ImgAPI';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const imgAPI = new ImgAPI();

let currentPage = 1;

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.searchForm.addEventListener('submit', onSearchImg);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

refs.loadMoreBtn.classList.add('is-hidden');

function onSearchImg(e) {
  e.preventDefault();

  const data = new FormData(e.target);
  const query = data.get('searchQuery').trim();

  if (query === '') {
    Notiflix.Notify.warning('Please enter a search query!');
    return;
  }

  currentPage = 1;

  imgAPI.searchImgByAxios(query, currentPage, 40).then(newImg => {
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

    if (newImg.totalHits <= 40) {
      refs.loadMoreBtn.classList.add('is-hidden');
    }
  });

  e.target.reset();
}

function onLoadMore() {
  const query = document.querySelector('input').value.trim();
  const currentImages = document.querySelectorAll('.photo-card').length;
  currentPage += 1;

  imgAPI
    .searchImgByAxios(query, currentPage, 40) // передаємо значення параметрів page та per_page
    .then(newImg => {
      renderImg(newImg.hits);
      if (newImg.totalHits <= currentImages + 12) {
        refs.loadMoreBtn.classList.add('is-hidden');
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        refs.loadMoreBtn.classList.remove('is-hidden'); // Показати кнопку якщо ще є зображення
      }
    })
    .catch(() => {
      Notiflix.Notify.failure('Oops, something went wrong!');
    });
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
