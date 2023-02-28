import axios from 'axios';

export class ImgAPI {
  BASE_URL = 'https://pixabay.com/api/';
  API_KEY = '33984657-99052f04a8590384bf426a6ee';

  getIMG() {
    return fetch(`${this.BASE_URL}?key=${this.API_KEY}`).then(res =>
      res.json()
    );
  }

  searchImg(newImg) {
    return fetch(
      `${this.BASE_URL}?key=${this.API_KEY}&q=${newImg}&image_type=photo&orientation=horizontal&per_page=12`
    ).then(res => res.json());
  }

  searchImgByAxios(query, page = 1, perPage = 40) {
    return axios
      .get(
        `${this.BASE_URL}?key=${this.API_KEY}&q=${query}&image_type=photo&orientation=horizontal&page=${page}&per_page=${perPage}`
      )
      .then(data => {
        console.log(data);
        return data.data;
      });
  }
}
